export interface BaseEntity {
    deleted: boolean;
    deleted_at: Date | null;
    created_at: Date | null;
    updated_at: Date | null;
    record_uid: string;
    object_uid: string;
}
