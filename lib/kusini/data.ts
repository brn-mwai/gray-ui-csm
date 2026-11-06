export type Housekeeping =
  | "clean"
  | "inspected"
  | "being_serviced"
  | "dirty"
  | "out_of_order"
  | "occupied"

export type RoomType = "Tented suite" | "Family" | "Honeymoon" | "Standard" | "Suite"

export type Room = {
  id: string
  name: string
  type: RoomType
  capacity: number
  beds: string
  features: string[]
  housekeeping: Housekeeping
}

export type AirstripCondition = "open" | "restricted" | "waterlogged" | "closed"

export type AirstripSurface = "murram" | "gravel" | "grass" | "tarmac"

export type Airstrip = {
  id: string
  code: string
  name: string
  region: string
  condition: AirstripCondition
  conditionNote?: string
  surface: AirstripSurface
  contactName: string
  contactRole: string
  connected: boolean
  driveMinutes: number
}

export type StaffRole = "driver-guide" | "guide" | "spotter" | "ops" | "housekeeping"

export type StaffCert = {
  label: string
  expiring?: boolean
}

export type Staff = {
  id: string
  initials: string
  name: string
  role: StaffRole
  phone: string
  telegram?: string
  connected: boolean
  certs: StaffCert[]
  languages: string[]
  dutyCap: number
  leaveEntitlement: number
}

export type Vehicle = {
  id: string
  name: string
  seats: number
}

export type GuestType = "adult" | "teen" | "child" | "infant"

export type RequirementKind = "dietary" | "allergy" | "medical" | "mobility"

export type RequirementSeverity = "preference" | "requirement" | "critical"

export type GuestRequirement = {
  kind: RequirementKind
  label: string
  severity: RequirementSeverity
}

export type GuestVip = "none" | "vip" | "vvip" | "repeat"

export type Guest = {
  id: string
  fullName: string
  type: GuestType
  age?: number
  isLead: boolean
  bookingRef: string
  roomId?: string
  stayFrom: string
  stayTo: string
  vip: GuestVip
  requirements: GuestRequirement[]
  tags: string[]
}

export type BookingStatus = "confirmed" | "provisional" | "in-house" | "checked-out"

export type BookingSource = "agent" | "direct" | "ota" | "repeat"

export type Booking = {
  ref: string
  leadGuestName: string
  adults: number
  children: number
  source: BookingSource
  agent?: string
  status: BookingStatus
}

export type MovementDirection = "in" | "out"

export type MovementMode = "Charter" | "Road" | "Scheduled" | "Helicopter"

export type MovementQueueStatus = "open" | "pending" | "resolved" | "closed"

export type MovementHealth = "on-track" | "warning" | "breached"

export type MovementChannel = "email" | "chat" | "slack"

export type MovementPriority = "urgent" | "high" | "medium" | "low" | "todo"

export type MovementTimelineLabel = "ETA" | "ETD" | "gate" | "arr"

export type Movement = {
  id: string
  movementNumber: string
  bookingRef: string
  direction: MovementDirection
  mode: MovementMode
  tail?: string
  carrier?: string
  originName?: string
  destinationName: string
  airstripCode?: string
  timelineLabel: MovementTimelineLabel
  timelineTime: string
  timelineDetail: string
  date: string
  queueStatus: MovementQueueStatus
  health: MovementHealth
  channel: MovementChannel
  priority: MovementPriority
  escalated: boolean
  pastDue: boolean
  escalationNote?: string
  assigneeStaffId?: string
  staffIds: string[]
}

export type DutyType = "pickup" | "dropoff" | "game-drive" | "bush-meal" | "standby"

export type DutyStatus = "draft" | "assigned" | "acknowledged" | "running" | "done"

export type Duty = {
  id: string
  movementId: string
  type: DutyType
  date: string
  time: string
  staffId?: string
  vehicleId?: string
  status: DutyStatus
}

export type LeaveType = "annual" | "compassionate" | "sick" | "off-rota"

export type LeaveStatus = "requested" | "approved" | "declined" | "taken"

export type LeaveRequest = {
  id: string
  staffId: string
  type: LeaveType
  from: string
  to: string
  days: number
  coverStaffId?: string
  status: LeaveStatus
  clash?: string
}

export type KusiniDataset = {
  rooms: Room[]
  airstrips: Airstrip[]
  staff: Staff[]
  vehicles: Vehicle[]
  guests: Guest[]
  bookings: Booking[]
  movements: Movement[]
  duties: Duty[]
  leaveRequests: LeaveRequest[]
}

const rooms: Room[] = [
  {
    id: "rm-fs4",
    name: "Family Suite 4",
    type: "Family",
    capacity: 4,
    beds: "1 king + 2 twin",
    features: ["ensuite", "view"],
    housekeeping: "inspected",
  },
  {
    id: "rm-hm1",
    name: "Honeymoon 1",
    type: "Honeymoon",
    capacity: 2,
    beds: "1 king",
    features: ["plunge pool"],
    housekeeping: "occupied",
  },
  {
    id: "rm-fu2",
    name: "Family Unit 2",
    type: "Family",
    capacity: 5,
    beds: "king + bunks",
    features: ["interconnecting", "accessible"],
    housekeeping: "being_serviced",
  },
  {
    id: "rm-ts9",
    name: "Tented Suite 9",
    type: "Tented suite",
    capacity: 2,
    beds: "2 twin",
    features: ["view"],
    housekeeping: "out_of_order",
  },
  {
    id: "rm-ts1",
    name: "Tented Suite 1",
    type: "Tented suite",
    capacity: 2,
    beds: "1 king",
    features: ["ensuite", "view"],
    housekeeping: "clean",
  },
]

const airstrips: Airstrip[] = [
  {
    id: "as-olk",
    code: "OLK",
    name: "Ol Kiombo",
    region: "Central Mara",
    condition: "open",
    surface: "murram",
    contactName: "Joseph Sankale",
    contactRole: "strip marshal",
    connected: true,
    driveMinutes: 25,
  },
  {
    id: "as-keu",
    code: "KEU",
    name: "Keekorok",
    region: "Mara Reserve",
    condition: "open",
    surface: "gravel",
    contactName: "Naomi Chepkoech",
    contactRole: "ops desk",
    connected: true,
    driveMinutes: 45,
  },
  {
    id: "as-mnc",
    code: "MNC",
    name: "Mara North",
    region: "Mara North Conservancy",
    condition: "restricted",
    conditionNote: "daylight only",
    surface: "murram",
    contactName: "Peter Kimeu",
    contactRole: "conservancy warden",
    connected: true,
    driveMinutes: 35,
  },
  {
    id: "as-mus",
    code: "MUS",
    name: "Musiara",
    region: "Mara Reserve",
    condition: "waterlogged",
    conditionNote: "no landings until inspected",
    surface: "grass",
    contactName: "Salome Nkoitoi",
    contactRole: "strip marshal",
    connected: false,
    driveMinutes: 55,
  },
  {
    id: "as-osk",
    code: "OSK",
    name: "Ol Seki",
    region: "Naboisho",
    condition: "open",
    surface: "murram",
    contactName: "Daniel Lemayian",
    contactRole: "camp liaison",
    connected: false,
    driveMinutes: 40,
  },
  {
    id: "as-sia",
    code: "SIA",
    name: "Siana Springs",
    region: "Siana",
    condition: "closed",
    conditionNote: "grading works to 25 Jul",
    surface: "gravel",
    contactName: "Ruth Wambui",
    contactRole: "ops desk",
    connected: true,
    driveMinutes: 70,
  },
  {
    id: "as-ktj",
    code: "KTJ",
    name: "Kichwa Tembo",
    region: "Mara Triangle",
    condition: "open",
    surface: "tarmac",
    contactName: "Ali Hassan",
    contactRole: "handling agent",
    connected: true,
    driveMinutes: 90,
  },
]

const staff: Staff[] = [
  {
    id: "st-mw",
    initials: "MW",
    name: "Mary Wanjiru",
    role: "ops",
    phone: "+254 722 118 004",
    telegram: "@marywanjiru",
    connected: true,
    certs: [{ label: "Dispatch" }],
    languages: ["English", "Swahili"],
    dutyCap: 0,
    leaveEntitlement: 21,
  },
  {
    id: "st-jl",
    initials: "JL",
    name: "Joseph Lekishon",
    role: "driver-guide",
    phone: "+254 722 401 118",
    telegram: "@jlekishon",
    connected: true,
    certs: [{ label: "KPSGA Silver" }, { label: "First aid" }],
    languages: ["English", "Swahili", "Maa"],
    dutyCap: 3,
    leaveEntitlement: 21,
  },
  {
    id: "st-dk",
    initials: "DK",
    name: "Daniel Kimeu",
    role: "driver-guide",
    phone: "+254 720 664 315",
    connected: false,
    certs: [{ label: "KPSGA Bronze" }, { label: "First aid", expiring: true }],
    languages: ["English", "Swahili"],
    dutyCap: 3,
    leaveEntitlement: 21,
  },
  {
    id: "st-sm",
    initials: "SM",
    name: "Salome Nkoitoi",
    role: "guide",
    phone: "+254 710 227 448",
    telegram: "@salome_n",
    connected: true,
    certs: [{ label: "KPSGA Silver" }, { label: "Bird specialist" }],
    languages: ["English", "Swahili", "Maa", "French"],
    dutyCap: 3,
    leaveEntitlement: 21,
  },
  {
    id: "st-jo",
    initials: "JO",
    name: "James Ochieng",
    role: "spotter",
    phone: "+254 745 903 771",
    connected: false,
    certs: [{ label: "First aid" }],
    languages: ["Swahili", "Maa"],
    dutyCap: 4,
    leaveEntitlement: 21,
  },
  {
    id: "st-pn",
    initials: "PN",
    name: "Peter Naserian",
    role: "driver-guide",
    phone: "+254 738 812 605",
    telegram: "@peter_n",
    connected: true,
    certs: [{ label: "KPSGA Bronze" }, { label: "Defensive driving" }],
    languages: ["English", "Swahili"],
    dutyCap: 3,
    leaveEntitlement: 21,
  },
  {
    id: "st-gn",
    initials: "GN",
    name: "Grace Njeri",
    role: "housekeeping",
    phone: "+254 726 550 190",
    telegram: "@gracen",
    connected: true,
    certs: [],
    languages: ["English", "Swahili"],
    dutyCap: 0,
    leaveEntitlement: 21,
  },
]

const vehicles: Vehicle[] = [
  { id: "vh-1", name: "Cruiser 1", seats: 6 },
  { id: "vh-2", name: "Cruiser 2", seats: 7 },
  { id: "vh-3", name: "Cruiser 3", seats: 7 },
  { id: "vh-4", name: "Cruiser 4", seats: 4 },
]

const guests: Guest[] = [
  {
    id: "g-pieter",
    fullName: "Pieter Mombaerts",
    type: "adult",
    isLead: true,
    bookingRef: "BK-1188",
    roomId: "rm-fs4",
    stayFrom: "17 Jul",
    stayTo: "21 Jul",
    vip: "none",
    requirements: [],
    tags: ["photographer"],
  },
  {
    id: "g-anna",
    fullName: "Anna Mombaerts",
    type: "adult",
    isLead: false,
    bookingRef: "BK-1188",
    roomId: "rm-fs4",
    stayFrom: "17 Jul",
    stayTo: "21 Jul",
    vip: "none",
    requirements: [{ kind: "dietary", label: "Vegetarian", severity: "requirement" }],
    tags: [],
  },
  {
    id: "g-emma",
    fullName: "Emma Mombaerts",
    type: "child",
    age: 7,
    isLead: false,
    bookingRef: "BK-1188",
    roomId: "rm-fs4",
    stayFrom: "17 Jul",
    stayTo: "21 Jul",
    vip: "none",
    requirements: [{ kind: "allergy", label: "Nut allergy · EpiPen", severity: "critical" }],
    tags: [],
  },
  {
    id: "g-grace",
    fullName: "Grace Okafor",
    type: "adult",
    isLead: true,
    bookingRef: "BK-1194",
    roomId: "rm-hm1",
    stayFrom: "15 Jul",
    stayTo: "18 Jul",
    vip: "vvip",
    requirements: [{ kind: "dietary", label: "Halal", severity: "requirement" }],
    tags: ["anniversary"],
  },
  {
    id: "g-daniel-perry",
    fullName: "Daniel Perry",
    type: "adult",
    isLead: true,
    bookingRef: "BK-1186",
    roomId: "rm-fu2",
    stayFrom: "17 Jul",
    stayTo: "20 Jul",
    vip: "none",
    requirements: [],
    tags: [],
  },
  {
    id: "g-noah",
    fullName: "Noah Perry",
    type: "infant",
    age: 1,
    isLead: false,
    bookingRef: "BK-1186",
    roomId: "rm-fu2",
    stayFrom: "17 Jul",
    stayTo: "20 Jul",
    vip: "none",
    requirements: [{ kind: "mobility", label: "Cot required", severity: "requirement" }],
    tags: [],
  },
  {
    id: "g-sam",
    fullName: "Sam Givens",
    type: "adult",
    isLead: true,
    bookingRef: "BK-1191",
    stayFrom: "19 Jul",
    stayTo: "24 Jul",
    vip: "none",
    requirements: [
      { kind: "allergy", label: "Shellfish", severity: "requirement" },
      { kind: "mobility", label: "No stairs", severity: "requirement" },
    ],
    tags: [],
  },
  {
    id: "g-lee",
    fullName: "Marcus Lee",
    type: "adult",
    isLead: true,
    bookingRef: "BK-1179",
    roomId: "rm-ts1",
    stayFrom: "12 Jul",
    stayTo: "17 Jul",
    vip: "repeat",
    requirements: [],
    tags: [],
  },
  {
    id: "g-gross",
    fullName: "Hannah Gross",
    type: "adult",
    isLead: true,
    bookingRef: "BK-1201",
    roomId: "rm-ts9",
    stayFrom: "17 Jul",
    stayTo: "22 Jul",
    vip: "vip",
    requirements: [{ kind: "medical", label: "Altitude medication", severity: "requirement" }],
    tags: [],
  },
  {
    id: "g-parsapet",
    fullName: "Simon Parsapet",
    type: "adult",
    isLead: true,
    bookingRef: "BK-1209",
    stayFrom: "18 Jul",
    stayTo: "23 Jul",
    vip: "none",
    requirements: [],
    tags: ["large party"],
  },
]

const bookings: Booking[] = [
  { ref: "BK-1179", leadGuestName: "Marcus Lee", adults: 2, children: 0, source: "repeat", status: "in-house" },
  { ref: "BK-1186", leadGuestName: "Daniel Perry", adults: 4, children: 3, source: "agent", agent: "Safari Collective", status: "in-house" },
  { ref: "BK-1188", leadGuestName: "Pieter Mombaerts", adults: 2, children: 1, source: "agent", agent: "Yellow Zebra", status: "in-house" },
  { ref: "BK-1191", leadGuestName: "Sam Givens", adults: 7, children: 0, source: "ota", status: "confirmed" },
  { ref: "BK-1194", leadGuestName: "Grace Okafor", adults: 2, children: 0, source: "direct", status: "in-house" },
  { ref: "BK-1201", leadGuestName: "Hannah Gross", adults: 1, children: 0, source: "direct", status: "in-house" },
  { ref: "BK-1168", leadGuestName: "Wei Chen", adults: 4, children: 0, source: "agent", agent: "Rhino Africa", status: "checked-out" },
  { ref: "BK-1203", leadGuestName: "Tom Hendricks", adults: 4, children: 0, source: "agent", agent: "Yellow Zebra", status: "confirmed" },
  { ref: "BK-1205", leadGuestName: "Alice Naserian", adults: 3, children: 0, source: "direct", status: "in-house" },
  { ref: "BK-1207", leadGuestName: "Brian Kip", adults: 2, children: 0, source: "repeat", status: "in-house" },
  { ref: "BK-1198", leadGuestName: "Mary Sironka", adults: 2, children: 0, source: "agent", agent: "Safari Collective", status: "in-house" },
  { ref: "BK-1209", leadGuestName: "Simon Parsapet", adults: 5, children: 2, source: "agent", agent: "Rhino Africa", status: "confirmed" },
  { ref: "BK-1172", leadGuestName: "Ann Tipis", adults: 5, children: 0, source: "direct", status: "checked-out" },
  { ref: "BK-1211", leadGuestName: "Ken Lemaiyan", adults: 2, children: 0, source: "direct", status: "in-house" },
  { ref: "BK-1213", leadGuestName: "Ivan Borma", adults: 1, children: 0, source: "ota", status: "in-house" },
  { ref: "BK-1215", leadGuestName: "Ella Reid", adults: 1, children: 0, source: "ota", status: "provisional" },
  { ref: "BK-1217", leadGuestName: "John Smith", adults: 2, children: 0, source: "direct", status: "checked-out" },
  { ref: "BK-1219", leadGuestName: "Nina Wick", adults: 2, children: 0, source: "agent", agent: "Yellow Zebra", status: "in-house" },
  { ref: "BK-1221", leadGuestName: "Ray Jordan", adults: 4, children: 0, source: "agent", agent: "Safari Collective", status: "in-house" },
  { ref: "BK-1223", leadGuestName: "Leo Macei", adults: 1, children: 0, source: "direct", status: "checked-out" },
]

const movements: Movement[] = [
  {
    id: "mv-001",
    movementNumber: "MV-001",
    bookingRef: "BK-1188",
    direction: "in",
    mode: "Charter",
    tail: "5Y-GCC",
    carrier: "Governors",
    originName: "Wilson",
    destinationName: "Riverbend",
    airstripCode: "OLK",
    timelineLabel: "ETA",
    timelineTime: "10h40",
    timelineDetail: "pickup 10h45",
    date: "17 Jul",
    queueStatus: "open",
    health: "warning",
    channel: "email",
    priority: "high",
    escalated: false,
    pastDue: true,
    assigneeStaffId: "st-mw",
    staffIds: ["st-mw", "st-jl", "st-dk"],
  },
  {
    id: "mv-002",
    movementNumber: "MV-002",
    bookingRef: "BK-1201",
    direction: "in",
    mode: "Charter",
    tail: "5Y-BMF",
    carrier: "Safarilink",
    originName: "Wilson",
    destinationName: "Riverbend",
    airstripCode: "OLK",
    timelineLabel: "ETA",
    timelineTime: "11h25",
    timelineDetail: "proposed 11h25",
    date: "17 Jul",
    queueStatus: "open",
    health: "on-track",
    channel: "slack",
    priority: "urgent",
    escalated: true,
    pastDue: false,
    escalationNote: "esc 41m",
    assigneeStaffId: "st-mw",
    staffIds: ["st-mw", "st-jl"],
  },
  {
    id: "mv-003",
    movementNumber: "MV-003",
    bookingRef: "BK-1179",
    direction: "out",
    mode: "Charter",
    tail: "5Y-GCA",
    carrier: "Governors",
    originName: "Riverbend",
    destinationName: "Wilson",
    airstripCode: "OLK",
    timelineLabel: "ETD",
    timelineTime: "14h45",
    timelineDetail: "report 14h15",
    date: "17 Jul",
    queueStatus: "pending",
    health: "breached",
    channel: "email",
    priority: "high",
    escalated: true,
    pastDue: true,
    assigneeStaffId: "st-mw",
    staffIds: ["st-jl", "st-mw"],
  },
  {
    id: "mv-004",
    movementNumber: "MV-004",
    bookingRef: "BK-1186",
    direction: "in",
    mode: "Road",
    carrier: "Loldia Ground",
    originName: "Nanyuki",
    destinationName: "Riverbend",
    timelineLabel: "gate",
    timelineTime: "~16h00",
    timelineDetail: "en route",
    date: "17 Jul",
    queueStatus: "open",
    health: "on-track",
    channel: "email",
    priority: "medium",
    escalated: false,
    pastDue: false,
    assigneeStaffId: "st-jl",
    staffIds: ["st-mw", "st-jo"],
  },
  {
    id: "mv-005",
    movementNumber: "MV-005",
    bookingRef: "BK-1191",
    direction: "in",
    mode: "Charter",
    destinationName: "Riverbend",
    airstripCode: "OSK",
    timelineLabel: "arr",
    timelineTime: "19 Jul",
    timelineDetail: "unscheduled",
    date: "19 Jul",
    queueStatus: "open",
    health: "warning",
    channel: "chat",
    priority: "medium",
    escalated: false,
    pastDue: false,
    staffIds: ["st-mw"],
  },
  {
    id: "mv-006",
    movementNumber: "MV-006",
    bookingRef: "BK-1194",
    direction: "out",
    mode: "Helicopter",
    tail: "5Y-HHM",
    carrier: "Tropic Air",
    originName: "Riverbend",
    destinationName: "Wilson",
    airstripCode: "KEU",
    timelineLabel: "ETD",
    timelineTime: "09h20",
    timelineDetail: "lifted 09h24",
    date: "18 Jul",
    queueStatus: "resolved",
    health: "on-track",
    channel: "chat",
    priority: "low",
    escalated: false,
    pastDue: false,
    assigneeStaffId: "st-mw",
    staffIds: ["st-mw", "st-sm"],
  },
  {
    id: "mv-007",
    movementNumber: "MV-007",
    bookingRef: "BK-1168",
    direction: "out",
    mode: "Scheduled",
    tail: "5Y-SLK",
    carrier: "Safarilink",
    originName: "Riverbend",
    destinationName: "JKIA",
    airstripCode: "KEU",
    timelineLabel: "ETD",
    timelineTime: "11h05",
    timelineDetail: "completed",
    date: "15 Jul",
    queueStatus: "closed",
    health: "on-track",
    channel: "chat",
    priority: "todo",
    escalated: false,
    pastDue: false,
    assigneeStaffId: "st-dk",
    staffIds: ["st-dk", "st-jl"],
  },
  {
    id: "mv-008",
    movementNumber: "MV-008",
    bookingRef: "BK-1203",
    direction: "in",
    mode: "Charter",
    carrier: "Governors",
    originName: "Wilson",
    destinationName: "Riverbend",
    airstripCode: "OLK",
    timelineLabel: "ETA",
    timelineTime: "13h10",
    timelineDetail: "re-protect pending",
    date: "18 Jul",
    queueStatus: "open",
    health: "warning",
    channel: "chat",
    priority: "urgent",
    escalated: true,
    pastDue: true,
    escalationNote: "esc 12m",
    staffIds: ["st-mw"],
  },
  {
    id: "mv-009",
    movementNumber: "MV-009",
    bookingRef: "BK-1205",
    direction: "in",
    mode: "Charter",
    tail: "5Y-BXP",
    carrier: "Air Kenya",
    originName: "Wilson",
    destinationName: "Riverbend",
    airstripCode: "MNC",
    timelineLabel: "ETA",
    timelineTime: "12h35",
    timelineDetail: "pickup 12h40",
    date: "18 Jul",
    queueStatus: "pending",
    health: "warning",
    channel: "email",
    priority: "high",
    escalated: false,
    pastDue: false,
    assigneeStaffId: "st-pn",
    staffIds: ["st-pn", "st-jo"],
  },
  {
    id: "mv-010",
    movementNumber: "MV-010",
    bookingRef: "BK-1207",
    direction: "in",
    mode: "Road",
    carrier: "Riverbend fleet",
    originName: "Sekenani gate",
    destinationName: "Riverbend",
    timelineLabel: "gate",
    timelineTime: "15h20",
    timelineDetail: "collected",
    date: "17 Jul",
    queueStatus: "resolved",
    health: "on-track",
    channel: "email",
    priority: "low",
    escalated: false,
    pastDue: false,
    assigneeStaffId: "st-sm",
    staffIds: ["st-sm"],
  },
  {
    id: "mv-011",
    movementNumber: "MV-011",
    bookingRef: "BK-1198",
    direction: "out",
    mode: "Charter",
    tail: "5Y-BNC",
    carrier: "Governors",
    originName: "Riverbend",
    destinationName: "Wilson",
    airstripCode: "OLK",
    timelineLabel: "ETD",
    timelineTime: "10h15",
    timelineDetail: "report 09h45",
    date: "19 Jul",
    queueStatus: "pending",
    health: "warning",
    channel: "chat",
    priority: "medium",
    escalated: false,
    pastDue: true,
    assigneeStaffId: "st-jo",
    staffIds: ["st-jo", "st-mw"],
  },
  {
    id: "mv-012",
    movementNumber: "MV-012",
    bookingRef: "BK-1209",
    direction: "in",
    mode: "Charter",
    tail: "5Y-CCX",
    carrier: "Safarilink",
    originName: "Wilson",
    destinationName: "Riverbend",
    airstripCode: "KEU",
    timelineLabel: "ETA",
    timelineTime: "14h05",
    timelineDetail: "needs 2 vehicles",
    date: "18 Jul",
    queueStatus: "open",
    health: "breached",
    channel: "slack",
    priority: "urgent",
    escalated: true,
    pastDue: true,
    escalationNote: "esc 1h 04m",
    assigneeStaffId: "st-mw",
    staffIds: ["st-mw", "st-jl", "st-pn", "st-sm"],
  },
  {
    id: "mv-013",
    movementNumber: "MV-013",
    bookingRef: "BK-1172",
    direction: "out",
    mode: "Road",
    carrier: "Riverbend fleet",
    originName: "Riverbend",
    destinationName: "Sand River",
    timelineLabel: "gate",
    timelineTime: "07h30",
    timelineDetail: "handed over",
    date: "15 Jul",
    queueStatus: "resolved",
    health: "on-track",
    channel: "email",
    priority: "medium",
    escalated: false,
    pastDue: false,
    assigneeStaffId: "st-jl",
    staffIds: ["st-jl"],
  },
  {
    id: "mv-014",
    movementNumber: "MV-014",
    bookingRef: "BK-1211",
    direction: "out",
    mode: "Charter",
    carrier: "Air Kenya",
    originName: "Riverbend",
    destinationName: "Wilson",
    airstripCode: "MNC",
    timelineLabel: "ETD",
    timelineTime: "16h40",
    timelineDetail: "report 16h10",
    date: "19 Jul",
    queueStatus: "open",
    health: "warning",
    channel: "email",
    priority: "high",
    escalated: false,
    pastDue: true,
    assigneeStaffId: "st-gn",
    staffIds: ["st-gn"],
  },
  {
    id: "mv-015",
    movementNumber: "MV-015",
    bookingRef: "BK-1213",
    direction: "out",
    mode: "Scheduled",
    tail: "5Y-SLM",
    carrier: "Safarilink",
    originName: "Riverbend",
    destinationName: "Wilson",
    airstripCode: "KEU",
    timelineLabel: "ETD",
    timelineTime: "08h05",
    timelineDetail: "report 07h20",
    date: "20 Jul",
    queueStatus: "pending",
    health: "on-track",
    channel: "chat",
    priority: "medium",
    escalated: false,
    pastDue: false,
    assigneeStaffId: "st-dk",
    staffIds: ["st-dk"],
  },
  {
    id: "mv-016",
    movementNumber: "MV-016",
    bookingRef: "BK-1215",
    direction: "in",
    mode: "Charter",
    carrier: "Governors",
    originName: "Wilson",
    destinationName: "Riverbend",
    airstripCode: "MUS",
    timelineLabel: "ETA",
    timelineTime: "17h15",
    timelineDetail: "strip waterlogged",
    date: "20 Jul",
    queueStatus: "open",
    health: "breached",
    channel: "slack",
    priority: "urgent",
    escalated: true,
    pastDue: true,
    escalationNote: "esc 26m",
    staffIds: ["st-mw", "st-pn"],
  },
  {
    id: "mv-017",
    movementNumber: "MV-017",
    bookingRef: "BK-1217",
    direction: "in",
    mode: "Road",
    carrier: "Riverbend fleet",
    originName: "Talek gate",
    destinationName: "Riverbend",
    timelineLabel: "gate",
    timelineTime: "11h50",
    timelineDetail: "completed",
    date: "14 Jul",
    queueStatus: "closed",
    health: "on-track",
    channel: "chat",
    priority: "todo",
    escalated: false,
    pastDue: false,
    assigneeStaffId: "st-pn",
    staffIds: ["st-pn"],
  },
  {
    id: "mv-018",
    movementNumber: "MV-018",
    bookingRef: "BK-1219",
    direction: "out",
    mode: "Charter",
    tail: "5Y-BKM",
    carrier: "Governors",
    originName: "Riverbend",
    destinationName: "Angama",
    airstripCode: "KTJ",
    timelineLabel: "ETD",
    timelineTime: "13h55",
    timelineDetail: "report 13h25",
    date: "21 Jul",
    queueStatus: "pending",
    health: "warning",
    channel: "email",
    priority: "high",
    escalated: false,
    pastDue: false,
    assigneeStaffId: "st-mw",
    staffIds: ["st-mw", "st-gn"],
  },
  {
    id: "mv-019",
    movementNumber: "MV-019",
    bookingRef: "BK-1221",
    direction: "in",
    mode: "Helicopter",
    tail: "5Y-HTA",
    carrier: "Tropic Air",
    originName: "Nairobi",
    destinationName: "Riverbend",
    airstripCode: "MUS",
    timelineLabel: "ETA",
    timelineTime: "09h05",
    timelineDetail: "landed 09h02",
    date: "18 Jul",
    queueStatus: "resolved",
    health: "on-track",
    channel: "slack",
    priority: "low",
    escalated: false,
    pastDue: false,
    assigneeStaffId: "st-sm",
    staffIds: ["st-sm", "st-jo"],
  },
  {
    id: "mv-020",
    movementNumber: "MV-020",
    bookingRef: "BK-1223",
    direction: "out",
    mode: "Road",
    carrier: "Loldia Ground",
    originName: "Riverbend",
    destinationName: "Nanyuki",
    timelineLabel: "gate",
    timelineTime: "06h40",
    timelineDetail: "completed",
    date: "16 Jul",
    queueStatus: "closed",
    health: "on-track",
    channel: "email",
    priority: "todo",
    escalated: false,
    pastDue: false,
    assigneeStaffId: "st-jo",
    staffIds: ["st-jo"],
  },
]

const duties: Duty[] = [
  {
    id: "dt-401",
    movementId: "mv-001",
    type: "pickup",
    date: "17 Jul",
    time: "10h45",
    staffId: "st-jl",
    vehicleId: "vh-2",
    status: "acknowledged",
  },
  {
    id: "dt-402",
    movementId: "mv-012",
    type: "pickup",
    date: "18 Jul",
    time: "14h05",
    staffId: "st-dk",
    vehicleId: "vh-1",
    status: "assigned",
  },
  {
    id: "dt-403",
    movementId: "mv-004",
    type: "pickup",
    date: "17 Jul",
    time: "16h00",
    staffId: "st-sm",
    vehicleId: "vh-3",
    status: "running",
  },
  {
    id: "dt-404",
    movementId: "mv-005",
    type: "pickup",
    date: "19 Jul",
    time: "12h15",
    status: "draft",
  },
  {
    id: "dt-405",
    movementId: "mv-009",
    type: "pickup",
    date: "18 Jul",
    time: "12h40",
    staffId: "st-pn",
    vehicleId: "vh-2",
    status: "assigned",
  },
  {
    id: "dt-406",
    movementId: "mv-016",
    type: "standby",
    date: "20 Jul",
    time: "17h15",
    staffId: "st-jo",
    status: "assigned",
  },
  {
    id: "dt-407",
    movementId: "mv-006",
    type: "dropoff",
    date: "18 Jul",
    time: "08h40",
    staffId: "st-jl",
    vehicleId: "vh-2",
    status: "done",
  },
  {
    id: "dt-408",
    movementId: "mv-008",
    type: "pickup",
    date: "18 Jul",
    time: "13h10",
    vehicleId: "vh-4",
    status: "draft",
  },
]

const leaveRequests: LeaveRequest[] = [
  {
    id: "lv-201",
    staffId: "st-dk",
    type: "annual",
    from: "24 Jul",
    to: "31 Jul",
    days: 8,
    status: "requested",
    clash: "3 movements unassigned that week",
  },
  {
    id: "lv-202",
    staffId: "st-sm",
    type: "annual",
    from: "02 Aug",
    to: "09 Aug",
    days: 8,
    coverStaffId: "st-pn",
    status: "approved",
  },
  {
    id: "lv-203",
    staffId: "st-gn",
    type: "sick",
    from: "18 Jul",
    to: "19 Jul",
    days: 2,
    coverStaffId: "st-mw",
    status: "taken",
  },
  {
    id: "lv-204",
    staffId: "st-jo",
    type: "compassionate",
    from: "26 Jul",
    to: "28 Jul",
    days: 3,
    status: "requested",
  },
  {
    id: "lv-205",
    staffId: "st-jl",
    type: "off-rota",
    from: "23 Jul",
    to: "23 Jul",
    days: 1,
    coverStaffId: "st-pn",
    status: "approved",
  },
  {
    id: "lv-206",
    staffId: "st-pn",
    type: "annual",
    from: "24 Jul",
    to: "27 Jul",
    days: 4,
    status: "declined",
    clash: "overlaps Daniel Kimeu leave",
  },
]

export const initialDataset: KusiniDataset = {
  rooms,
  airstrips,
  staff,
  vehicles,
  guests,
  bookings,
  movements,
  duties,
  leaveRequests,
}
