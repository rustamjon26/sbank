-- Insert seed employees
INSERT INTO public.employees (first_name, last_name, email, department, branch) VALUES
('John', 'Smith', 'john.smith@bank.com', 'IT', 'Headquarters'),
('Sarah', 'Johnson', 'sarah.johnson@bank.com', 'Finance', 'Branch A'),
('Michael', 'Brown', 'michael.brown@bank.com', 'Operations', 'Branch B'),
('Emily', 'Davis', 'emily.davis@bank.com', 'HR', 'Headquarters'),
('David', 'Wilson', 'david.wilson@bank.com', 'Security', 'Branch A')
ON CONFLICT (email) DO NOTHING;

-- Insert seed assets
INSERT INTO public.assets (name, asset_type, category, serial_number, purchase_date, branch, department, status, qr_code_data) VALUES
('Dell Laptop XPS 15', 'Laptop', 'IT', 'SN-LAPTOP-001', '2023-01-15', 'Headquarters', 'IT', 'REGISTERED', 'ASSET-SN-LAPTOP-001'),
('HP Printer LaserJet', 'Printer', 'OFFICE', 'SN-PRINTER-001', '2022-06-20', 'Branch A', 'Operations', 'REGISTERED', 'ASSET-SN-PRINTER-001'),
('Cisco Router 2900', 'Router', 'NETWORK', 'SN-ROUTER-001', '2021-03-10', 'Headquarters', 'IT', 'REGISTERED', 'ASSET-SN-ROUTER-001'),
('Security Camera HD', 'Camera', 'SECURITY', 'SN-CAMERA-001', '2022-09-05', 'Branch A', 'Security', 'REGISTERED', 'ASSET-SN-CAMERA-001'),
('Office Desk Standard', 'Desk', 'OFFICE', 'SN-DESK-001', '2020-11-12', 'Branch B', 'Operations', 'REGISTERED', 'ASSET-SN-DESK-001')
ON CONFLICT (serial_number) DO NOTHING;