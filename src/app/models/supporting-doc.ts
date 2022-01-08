import { FileUpload } from "./file-upload";

export class SupportingDoc {
    name ?: string;
    file ?: File;
    url ?: string;
    notes ?: string;
    attachmentCreatorKey ?: string;
    path ?: string;
    isLinked : boolean = false;
    fileUpload ?: FileUpload | null;
}
