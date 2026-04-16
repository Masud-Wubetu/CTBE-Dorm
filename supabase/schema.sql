-- CTBE Dormitory Allocation System Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Types
CREATE TYPE gender_enum AS ENUM ('Male', 'Female');
CREATE TYPE application_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE maintenance_status AS ENUM ('Open', 'In Progress', 'Closed');

-- 1. Proctors (Linked to Supabase Auth)
CREATE TABLE proctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Buildings
CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    proctor_id UUID REFERENCES proctors(id) ON DELETE SET NULL,
    type gender_enum NOT NULL,
    total_rooms INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Rooms
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    building_id INT REFERENCES buildings(id) ON DELETE CASCADE,
    floor INT NOT NULL,
    capacity INT NOT NULL,
    current_occupancy INT DEFAULT 0,
    is_available BOOLEAN GENERATED ALWAYS AS (current_occupancy < capacity) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Students (Linked to Supabase Auth)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    gender gender_enum NOT NULL,
    year_of_study INT CHECK (year_of_study BETWEEN 1 AND 5),
    program TEXT,
    building_id INT REFERENCES buildings(id),
    room_id INT REFERENCES rooms(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Room Applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    preferred_building_id INT REFERENCES buildings(id),
    preferred_floor INT,
    status application_status DEFAULT 'Pending',
    application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Maintenance Requests
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES students(id),
    issue_description TEXT NOT NULL,
    status maintenance_status DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample Data
-- (Add sample data later once tables are verified)
