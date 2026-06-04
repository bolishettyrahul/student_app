-- Migration: 20260601000000_add_metrics.sql
-- Add academic standing and instructor details derived from the Stitch UI reference

ALTER TABLE public.profiles
ADD COLUMN gpa numeric DEFAULT 0.0,
ADD COLUMN credits_earned integer DEFAULT 0,
ADD COLUMN credits_required integer DEFAULT 120,
ADD COLUMN attendance_percentage numeric DEFAULT 100.0;

ALTER TABLE public.subjects
ADD COLUMN instructor_name text;
