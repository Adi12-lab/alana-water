import {z} from "zod"

export const authSchema = z.object({
    username: z.string().min(2, {message: "Username harus ada"}).max(255),
    password: z.string().min(6, {message: "Password minimal 6 karakter"}).max(255)
})

export type Auth = z.infer<typeof authSchema>