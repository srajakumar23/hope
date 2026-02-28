import Database from "better-sqlite3";
import path from "path";

const DB_FILE = path.join(process.cwd(), "dev.db");
const db = new Database(DB_FILE);

// Initialize DB with some defaults if needed (Schema should already be there from db push)
db.pragma('journal_mode = WAL');

export const prisma: any = {
    partner: {
        findUnique: async ({ where }: any) => {
            const row = db.prepare(`SELECT * FROM Partner WHERE id = ? OR partnerCode = ? OR mobile = ? OR email = ?`).get(
                where.id || null,
                where.partnerCode || null,
                where.mobile || null,
                where.email || null
            );
            return row || null;
        },
        findFirst: async ({ where }: any) => {
            const row = db.prepare(`SELECT * FROM Partner WHERE email = ? OR mobile = ? OR partnerCode = ? OR id = ?`).get(
                where.email || null,
                where.mobile || null,
                where.partnerCode || null,
                where.id || null
            );
            return row || null;
        },
        create: async ({ data }: any) => {
            const id = data.id || `p_${Date.now()}`;
            const stmt = db.prepare(`
                INSERT INTO Partner (id, partnerCode, name, email, mobile, commissionSlab, guestDiscountSlab, status, walletBalance, joinedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                id,
                data.partnerCode,
                data.name,
                data.email || null,
                data.mobile,
                data.commissionSlab || 7.5,
                data.guestDiscountSlab || data.commissionSlab || 7.5,
                data.status || "PENDING",
                data.walletBalance || 0,
                new Date().getTime()
            );
            return { id, ...data };
        },
        update: async ({ where, data }: any) => {
            const prev = db.prepare(`SELECT * FROM Partner WHERE id = ? OR partnerCode = ?`).get(where.id || null, where.partnerCode || null);
            if (!prev) return null;
            const updated = { ...prev, ...data };
            const fields = Object.keys(data).map(k => `${k} = ?`).join(", ");
            const values = Object.values(data);
            const stmt = db.prepare(`UPDATE Partner SET ${fields} WHERE id = ? OR partnerCode = ?`);
            stmt.run(...values, where.id || null, where.partnerCode || null);
            return updated;
        },
        findMany: async () => {
            return db.prepare(`SELECT * FROM Partner`).all();
        }
    },
    guest: {
        findMany: async ({ where, include }: any = {}) => {
            let query = `SELECT * FROM Guest`;
            const params: any[] = [];
            if (where?.partnerId) {
                query += ` WHERE partnerId = ?`;
                params.push(where.partnerId);
            }
            const rows: any[] = db.prepare(query).all(...params);

            if (include?.partner) {
                for (const r of rows) {
                    r.partner = db.prepare(`SELECT * FROM Partner WHERE id = ?`).get(r.partnerId);
                }
            }
            if (include?.dynamicQr) {
                for (const r of rows) {
                    r.dynamicQr = db.prepare(`SELECT * FROM DynamicQR WHERE guestId = ?`).get(r.id);
                    if (r.dynamicQr) r.dynamicQr.expiresAt = new Date(r.dynamicQr.expiresAt);
                }
            }
            return rows;
        },
        findUnique: async ({ where, include }: any) => {
            const row: any = db.prepare(`SELECT * FROM Guest WHERE id = ? OR mobileNumber = ?`).get(
                where.id || null,
                where.mobileNumber || null
            );
            if (!row) return null;
            if (include?.partner) {
                row.partner = db.prepare(`SELECT * FROM Partner WHERE id = ?`).get(row.partnerId);
            }
            if (include?.dynamicQr) {
                row.dynamicQr = db.prepare(`SELECT * FROM DynamicQR WHERE guestId = ?`).get(row.id);
                if (row.dynamicQr) {
                    row.dynamicQr.expiresAt = new Date(row.dynamicQr.expiresAt);
                }
            }
            return row;
        },
        count: async ({ where }: any) => {
            const row: any = db.prepare(`SELECT COUNT(*) as count FROM Guest WHERE partnerId = ?`).get(where?.partnerId);
            return row.count;
        },
        create: async ({ data }: any) => {
            const id = data.id || `g_${Date.now()}`;
            const stmt = db.prepare(`INSERT INTO Guest (id, name, mobileNumber, partnerId, createdAt) VALUES (?, ?, ?, ?, ?)`);
            stmt.run(id, data.name, data.mobileNumber, data.partnerId, new Date().getTime());
            return { id, ...data, createdAt: new Date() };
        }
    },
    scanLog: {
        findMany: async ({ where, include }: any = {}) => {
            let query = `SELECT * FROM ScanLog`;
            const params: any[] = [];
            const conditions: string[] = [];

            if (where?.status) {
                if (typeof where.status === 'object' && where.status.in) {
                    conditions.push(`status IN (${where.status.in.map(() => "?").join(",")})`);
                    params.push(...where.status.in);
                } else {
                    conditions.push(`status = ?`);
                    params.push(where.status);
                }
            }

            if (where?.guest?.partnerId) {
                conditions.push(`guestId IN (SELECT id FROM Guest WHERE partnerId = ?)`);
                params.push(where.guest.partnerId);
            }

            if (conditions.length > 0) {
                query += ` WHERE ` + conditions.join(" AND ");
            }

            const rows: any[] = db.prepare(query).all(...params);
            return rows.map(r => {
                const res = { ...r, createdAt: new Date(r.createdAt) };
                if (include?.guest) {
                    res.guest = db.prepare(`SELECT * FROM Guest WHERE id = ?`).get(r.guestId);
                }
                return res;
            });
        },
        findFirst: async ({ where }: any) => {
            let query = `SELECT * FROM ScanLog WHERE guestId = ?`;
            const params: any[] = [where.guestId];
            if (where?.createdAt?.gte) {
                query += ` AND createdAt >= ?`;
                params.push(new Date(where.createdAt.gte).getTime());
            }
            query += ` ORDER BY createdAt DESC LIMIT 1`;
            const row: any = db.prepare(query).get(...params);
            return row ? { ...row, createdAt: new Date(row.createdAt) } : null;
        },
        create: async ({ data }: any) => {
            const id = data.id || `s_${Date.now()}`;
            const stmt = db.prepare(`
                INSERT INTO ScanLog (id, guestId, adminId, billAmount, discountAmount, guestDiscountAmount, partnerCommissionAmount, status, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const now = new Date().getTime();
            stmt.run(
                id,
                data.guestId,
                data.adminId,
                data.billAmount,
                data.discountAmount,
                data.guestDiscountAmount || 0,
                data.partnerCommissionAmount || 0,
                data.status || "SETTLED",
                now
            );
            return { id, ...data, createdAt: new Date(now) };
        },
        updateMany: async ({ where, data }: any) => {
            let query = `UPDATE ScanLog SET status = ? WHERE 1=1`;
            const params: any[] = [data.status];

            if (where.id?.in) {
                query += ` AND id IN (${where.id.in.map(() => "?").join(",")})`;
                params.push(...where.id.in);
            }
            if (where.status) {
                query += ` AND status = ?`;
                params.push(where.status);
            }
            if (where.guestId?.in) {
                query += ` AND guestId IN (${where.guestId.in.map(() => "?").join(",")})`;
                params.push(...where.guestId.in);
            }

            const info = db.prepare(query).run(...params);
            return { count: info.changes };
        }
    },
    dynamicQr: {
        findUnique: async ({ where }: any) => {
            const row: any = db.prepare(`SELECT * FROM DynamicQR WHERE id = ? OR guestId = ?`).get(where.id || null, where.guestId || null);
            if (!row) return null;
            return { ...row, expiresAt: new Date(row.expiresAt) };
        },
        upsert: async ({ where, create, update }: any) => {
            const existing: any = db.prepare(`SELECT * FROM DynamicQR WHERE guestId = ?`).get(where.guestId);
            if (existing) {
                // Remove id from update if present to avoid updating primary key
                const { id: _, ...updateData } = update;
                const fields = Object.keys(updateData).map(k => `${k} = ?`).join(", ");
                const values = Object.values(updateData).map(v => v instanceof Date ? v.getTime() : v);
                db.prepare(`UPDATE DynamicQR SET ${fields} WHERE guestId = ?`).run(...values, where.guestId);
                return { ...existing, ...updateData, expiresAt: new Date(update.expiresAt || existing.expiresAt) };
            } else {
                const id = create.id || `q_${Date.now()}`;
                db.prepare(`INSERT INTO DynamicQR (id, guestId, secretKey, expiresAt) VALUES (?, ?, ?, ?)`).run(
                    id, create.guestId, create.secretKey, new Date(create.expiresAt).getTime()
                );
                return { id, ...create, expiresAt: new Date(create.expiresAt) };
            }
        }
    },
    payout: {
        create: async ({ data }: any) => {
            const id = data.id || `payout_${Date.now()}`;
            const stmt = db.prepare(`
                INSERT INTO Payout (id, partnerId, amount, status, method, logsCount, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            const now = new Date().getTime();
            stmt.run(
                id,
                data.partnerId,
                data.amount,
                data.status || "COMPLETED",
                data.method || "BANK_TRANSFER",
                data.logsCount || 0,
                now
            );
            return { id, ...data, createdAt: new Date(now) };
        },
        findMany: async ({ where }: any = {}) => {
            let query = `SELECT * FROM Payout`;
            const params: any[] = [];
            if (where?.partnerId) {
                query += ` WHERE partnerId = ?`;
                params.push(where.partnerId);
            }
            const rows: any[] = db.prepare(query).all(...params);
            return rows.map(r => ({ ...r, createdAt: new Date(r.createdAt) }));
        }
    }
};

// Aliases for casing compatibility
prisma.Partner = prisma.partner;
prisma.Guest = prisma.guest;
prisma.ScanLog = prisma.scanLog;
prisma.Payout = prisma.payout;
prisma.DynamicQr = prisma.dynamicQr;
prisma.dynamicQR = prisma.dynamicQr;
prisma.DynamicQR = prisma.dynamicQr;

export function getPrisma() {
    return prisma;
}
