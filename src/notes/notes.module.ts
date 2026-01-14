import { Module } from "@nestjs/common";
import { NotesController } from "./notes.controller";
import { NotesService } from "./notes.service";
import { NOTES_REPOSITORY_TOKEN } from "./repositories/notes.repository.interface";
import { JsonNotesRepository } from "./repositories/json-notes.repository";

@Module({
    controllers: [NotesController],
    providers: [
        NotesService,
        {
            provide: NOTES_REPOSITORY_TOKEN,
            useClass: JsonNotesRepository,
        },
    ],
})
export class NotesModule { }
