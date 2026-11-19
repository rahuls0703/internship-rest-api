const express = require("express");
const { z } = require("zod");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const internshipSchema = z.object({
  company: z.string().trim().min(2).max(100),
  role: z.string().trim().min(2).max(100),
  location: z.string().trim().min(2).max(100),
  type: z.enum(["Remote", "Hybrid", "On-site"]),
  stipend: z.string().trim().max(100).optional().default("Not specified"),
  duration: z.string().trim().min(1).max(50),
  apply_url: z.string().url(),
  description: z.string().trim().min(10).max(2000)
});

const selectAll = db.prepare("SELECT * FROM internships ORDER BY id DESC");
const selectById = db.prepare("SELECT * FROM internships WHERE id = ?");
const insertOne = db.prepare(`
  INSERT INTO internships
  (company, role, location, type, stipend, duration, apply_url, description)
  VALUES (@company, @role, @location, @type, @stipend, @duration, @apply_url, @description)
`);
const updateOne = db.prepare(`
  UPDATE internships SET
  company=@company, role=@role, location=@location, type=@type,
  stipend=@stipend, duration=@duration, apply_url=@apply_url,
  description=@description
  WHERE id=@id
`);

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "Internship REST API is running" });
});

// LIST with pagination and optional search
app.get("/api/internships", (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const offset = (page - 1) * limit;
  const search = String(req.query.search || "").trim();

  const where = search ? "WHERE company LIKE @search OR role LIKE @search" : "";
  const params = search ? { search: `%${search}%`, limit, offset } : { limit, offset };
  const total = db.prepare(`SELECT COUNT(*) AS count FROM internships ${where}`)
    .get(search ? { search: `%${search}%` } : {}).count;
  const rows = db.prepare(`
    SELECT * FROM internships ${where}
    ORDER BY id DESC LIMIT @limit OFFSET @offset
  `).all(params);

  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});

// DETAIL
app.get("/api/internships/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, error: "ID must be a positive integer" });

  const internship = selectById.get(id);
  if (!internship) return res.status(404).json({ success: false, error: "Internship not found" });
  res.json({ success: true, data: internship });
});

// CREATE
app.post("/api/internships", (req, res) => {
  const parsed = internshipSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: parsed.error.issues.map(issue => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  const result = insertOne.run(parsed.data);
  const created = selectById.get(result.lastInsertRowid);
  res.status(201).json({ success: true, message: "Internship created", data: created });
});

// UPDATE (full replacement of editable fields)
app.put("/api/internships/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, error: "ID must be a positive integer" });
  if (!selectById.get(id)) return res.status(404).json({ success: false, error: "Internship not found" });

  const parsed = internshipSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: parsed.error.issues.map(issue => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  updateOne.run({ ...parsed.data, id });
  res.json({ success: true, message: "Internship updated", data: selectById.get(id) });
});

// DELETE
app.delete("/api/internships/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, error: "ID must be a positive integer" });

  const result = db.prepare("DELETE FROM internships WHERE id = ?").run(id);
  if (result.changes === 0) return res.status(404).json({ success: false, error: "Internship not found" });
  res.json({ success: true, message: "Internship deleted" });
});

// Consistent JSON for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Unexpected errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
