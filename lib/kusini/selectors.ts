import type {
  Booking,
  Duty,
  Guest,
  KusiniDataset,
  LeaveRequest,
  Movement,
  Staff,
} from "@/lib/kusini/data"

export function partySize(dataset: KusiniDataset, bookingRef: string) {
  const booking = dataset.bookings.find((row) => row.ref === bookingRef)
  if (!booking) return 0
  return booking.adults + booking.children
}

export function bookingLastName(dataset: KusiniDataset, bookingRef: string) {
  const booking = dataset.bookings.find((row) => row.ref === bookingRef)
  if (!booking) return bookingRef
  const parts = booking.leadGuestName.split(" ")
  return parts[parts.length - 1]
}

export function airstripByCode(dataset: KusiniDataset, code?: string) {
  if (!code) return undefined
  return dataset.airstrips.find((row) => row.code === code)
}

export function staffById(dataset: KusiniDataset, id?: string) {
  if (!id) return undefined
  return dataset.staff.find((row) => row.id === id)
}

export function roomById(dataset: KusiniDataset, id?: string) {
  if (!id) return undefined
  return dataset.rooms.find((row) => row.id === id)
}

export function movementById(dataset: KusiniDataset, id: string) {
  return dataset.movements.find((row) => row.id === id)
}

export function vehicleById(dataset: KusiniDataset, id?: string) {
  if (!id) return undefined
  return dataset.vehicles.find((row) => row.id === id)
}

export function guestsForBooking(dataset: KusiniDataset, bookingRef: string): Guest[] {
  return dataset.guests.filter((row) => row.bookingRef === bookingRef)
}

export function movementsForBooking(
  dataset: KusiniDataset,
  bookingRef: string
): Movement[] {
  return dataset.movements.filter((row) => row.bookingRef === bookingRef)
}

export function arrivalMovement(dataset: KusiniDataset, booking: Booking) {
  return movementsForBooking(dataset, booking.ref).find((row) => row.direction === "in")
}

export function departureMovement(dataset: KusiniDataset, booking: Booking) {
  return movementsForBooking(dataset, booking.ref).find((row) => row.direction === "out")
}

// A movement counts as acknowledged once it has left the posted column.
export function movementAck(movement?: Movement) {
  if (!movement) return "unassigned" as const
  if (movement.queueStatus === "open") {
    return movement.assigneeStaffId ? ("awaiting" as const) : ("unassigned" as const)
  }
  return "acknowledged" as const
}

export function dutiesForStaff(dataset: KusiniDataset, staffId: string): Duty[] {
  return dataset.duties.filter((row) => row.staffId === staffId)
}

export function leaveForStaff(dataset: KusiniDataset, staffId: string): LeaveRequest[] {
  return dataset.leaveRequests.filter((row) => row.staffId === staffId)
}

export function leaveDaysTaken(dataset: KusiniDataset, staffId: string) {
  return leaveForStaff(dataset, staffId)
    .filter((row) => row.status === "approved" || row.status === "taken")
    .reduce((total, row) => total + row.days, 0)
}

export function dutyCount(dataset: KusiniDataset, staff: Staff) {
  return dutiesForStaff(dataset, staff.id).filter((row) => row.status !== "done").length
}

export function movementsAtAirstrip(dataset: KusiniDataset, code: string) {
  return dataset.movements.filter((row) => row.airstripCode === code)
}

export function roomOccupant(dataset: KusiniDataset, roomId: string) {
  const guest = dataset.guests.find((row) => row.roomId === roomId && row.isLead)
  if (guest) return guest
  return dataset.guests.find((row) => row.roomId === roomId)
}

export function dutyPax(dataset: KusiniDataset, duty: Duty) {
  const movement = movementById(dataset, duty.movementId)
  if (!movement) return 0
  return partySize(dataset, movement.bookingRef)
}

export function nextDutyForStaff(dataset: KusiniDataset, staffId: string) {
  return dutiesForStaff(dataset, staffId).find((duty) => duty.status !== "done")
}
