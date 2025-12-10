export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  coordinates: { lat: number; lng: number }
  workingHours: string
  services: string[]
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  branchId: string
  branchName: string
  date: string
  time: string
  service: string
  status: "scheduled" | "completed" | "cancelled" | "no-show"
  notes?: string
  createdAt: string
}

export interface Treatment {
  id: string
  patientId: string
  doctorId: string
  doctorName: string
  date: string
  diagnosis: string
  treatment: string
  prescription?: string
  cost: number
  notes?: string
}

export const BRANCHES: Branch[] = [
  {
    id: "branch-1",
    name: "Downtown Dental Clinic",
    address: "123 Main Street, Downtown, City 10001",
    phone: "+1 (555) 123-4567",
    coordinates: { lat: 40.7128, lng: -74.006 },
    workingHours: "Mon-Fri: 8AM-6PM, Sat: 9AM-3PM",
    services: ["General Dentistry", "Orthodontics", "Cosmetic Dentistry", "Emergency Care"],
  },
  {
    id: "branch-2",
    name: "Westside Dental Center",
    address: "456 West Avenue, Westside, City 10002",
    phone: "+1 (555) 234-5678",
    coordinates: { lat: 40.7589, lng: -73.9851 },
    workingHours: "Mon-Fri: 9AM-7PM, Sat: 10AM-4PM",
    services: ["General Dentistry", "Pediatric Dentistry", "Root Canal", "Teeth Whitening"],
  },
  {
    id: "branch-3",
    name: "East End Dental Spa",
    address: "789 East Boulevard, East End, City 10003",
    phone: "+1 (555) 345-6789",
    coordinates: { lat: 40.7489, lng: -73.968 },
    workingHours: "Mon-Sat: 8AM-8PM, Sun: 10AM-5PM",
    services: ["Cosmetic Dentistry", "Implants", "Veneers", "Teeth Whitening", "General Care"],
  },
  {
    id: "branch-4",
    name: "Northside Family Dental",
    address: "321 North Street, Northside, City 10004",
    phone: "+1 (555) 456-7890",
    coordinates: { lat: 40.7829, lng: -73.9654 },
    workingHours: "Mon-Fri: 8AM-5PM, Sat: 9AM-2PM",
    services: ["Family Dentistry", "Pediatric Care", "Orthodontics", "Emergency Care"],
  },
]

export const SERVICES = [
  "General Checkup",
  "Teeth Cleaning",
  "Filling",
  "Root Canal",
  "Extraction",
  "Orthodontics",
  "Teeth Whitening",
  "Dental Implants",
  "Veneers",
  "Emergency Care",
]

export const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
]
