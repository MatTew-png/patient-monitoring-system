export interface Line_Group {
  line_group_id: string;
  line_group_name: string;
  ward_id?: number;
}

export interface SelectedGroup {
  groupId: string;
  groupName: string;
  wardId: number;
}

export interface SelectedDeleteGroup {
  line_group_id: string;
  line_group_name: string;
}
