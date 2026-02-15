import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  varchar,
  jsonb,
  bigint,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("viewer"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  notificationEmail: boolean("notification_email").default(true),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
});

export const devices = pgTable("devices", {
  id: uuid("id").defaultRandom().primaryKey(),
  ipAddress: varchar("ip_address").notNull(), // using varchar for inet for simplicity in Drizzle
  macAddress: varchar("mac_address").unique(),
  hostname: varchar("hostname", { length: 255 }),
  deviceType: varchar("device_type", { length: 50 }).default("unknown").notNull(),
  vendor: varchar("vendor", { length: 255 }),
  status: varchar("status", { length: 50 }).default("online").notNull(),
  discoveryMethod: varchar("discovery_method", { length: 50 }),
  firstSeen: timestamp("first_seen", { withTimezone: true }).defaultNow().notNull(),
  lastSeen: timestamp("last_seen", { withTimezone: true }).defaultNow().notNull(),
  location: varchar("location", { length: 255 }),
  snmpCommunity: varchar("snmp_community", { length: 255 }),
  snmpVersion: integer("snmp_version"),
  monitorBandwidth: boolean("monitor_bandwidth").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

import { relations } from "drizzle-orm";

export const alerts = pgTable("alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  deviceId: uuid("device_id").references(() => devices.id),
  sourceIp: varchar("source_ip"),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  triggeredAt: timestamp("triggered_at", { withTimezone: true }).defaultNow().notNull(),
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolutionNote: text("resolution_note"),
});

// TimescaleDB Hypertable (metrics)
export const bandwidthMetrics = pgTable("bandwidth_metrics", {
  time: timestamp("time", { withTimezone: true }).notNull(),
  deviceId: uuid("device_id").references(() => devices.id),
  interfaceName: text("interface_name"),
  downloadBps: bigint("download_bps", { mode: "number" }).notNull(),
  uploadBps: bigint("upload_bps", { mode: "number" }).notNull(),
  downloadBytes: bigint("download_bytes", { mode: "number" }).notNull(),
  uploadBytes: bigint("upload_bytes", { mode: "number" }).notNull(),
  errorsIn: integer("errors_in").default(0),
  errorsOut: integer("errors_out").default(0),
}, (table) => {
  return {
    idxDeviceTime: index("idx_bandwidth_device_time").on(table.deviceId, table.time),
  };
});

// TimescaleDB Hypertable (security events)
export const securityEvents = pgTable("security_events", {
  time: timestamp("time", { withTimezone: true }).notNull(),
  eventId: text("event_id").notNull(),
  eventType: text("event_type").notNull(),
  alertSeverity: integer("alert_severity"),
  alertSignature: text("alert_signature"),
  srcIp: varchar("src_ip").notNull(),
  destIp: varchar("dest_ip").notNull(),
  srcPort: integer("src_port"),
  destPort: integer("dest_port"),
  proto: text("proto"),
  action: varchar("action", { length: 50 }),
  rawEvent: jsonb("raw_event"),
}, (table) => {
  return {
    idxSrcIp: index("idx_security_src_ip").on(table.srcIp, table.time),
    idxSeverity: index("idx_security_severity").on(table.alertSeverity, table.time),
  };
});

export const alertsRelations = relations(alerts, ({ one }) => ({
  device: one(devices, {
    fields: [alerts.deviceId],
    references: [devices.id],
  }),
}));
