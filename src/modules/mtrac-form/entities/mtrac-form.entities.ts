import { MTRACFormStatus } from ".prisma/client"
import { ApiProperty } from "@nestjs/swagger"

export class MTRACForm {
  @ApiProperty()
  id: number

  @ApiProperty()
  overAllRisk: string

  @ApiProperty()
  dispatchDate: Date

  @ApiProperty()
  dispatchTime: Date

  @ApiProperty()
  releaseDate: Date

  @ApiProperty()
  releaseTime: Date

  @ApiProperty()
  isAdditionalDetailApplicable: boolean

  @ApiProperty()
  driverRiskAssessmentChecklist: string[]

  @ApiProperty()
  otherRiskAssessmentChecklist: string[]

  @ApiProperty()
  safetyMeasures: string

  @ApiProperty()
  rankAndName: string

  @ApiProperty()
  personalPin: string

  @ApiProperty()
  deleted: boolean

  @ApiProperty()
  filledBy: object

  @ApiProperty({ enum: MTRACFormStatus})
  status: MTRACFormStatus

  @ApiProperty()
  tripId: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class FindManyMTRACFormResult {
  @ApiProperty()
  count: number

  @ApiProperty({ type: [MTRACForm]})
  records: MTRACForm[]
}

export class FindManyMTRACFormResultNoCount {
  @ApiProperty({ type: [MTRACForm]})
  records: MTRACForm[]
}
