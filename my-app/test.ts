model Attendance {
  id           String    @id @default(uuid())
  studentId    Int       @map("student_id") // Changed to Int to match Student.id
  classId      String    @map("class_id")
  checkInTime  DateTime  @map("check_in_time")
  checkOutTime DateTime? @map("check_out_time")
  year         Int
  day          Int
  student      Student   @relation(fields: [studentId], references: [id])
  class        Class     @relation(fields: [classId], references: [id])
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  @@map("attendances")
}