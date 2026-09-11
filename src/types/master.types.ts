export interface MasterBloodGroup {
  bloodGroupId: number;
  bloodGroupName: string;
  isActive?: boolean;
}

export interface MasterBloodComponent {
  bloodComponentId: number;
  bloodComponentName: string;
  shelfLifeDays?: number;
  isActive?: boolean;
}
