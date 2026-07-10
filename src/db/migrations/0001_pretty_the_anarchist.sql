CREATE TABLE "otp_send_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "otp_send_log_phone_idx" ON "otp_send_log" USING btree ("phone","created_at");--> statement-breakpoint
CREATE INDEX "otp_send_log_ip_idx" ON "otp_send_log" USING btree ("ip_address","created_at");