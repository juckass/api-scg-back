import { User } from "@prisma/client";

export function removePassword(user: User) {
    delete user.password;
    return user;
}