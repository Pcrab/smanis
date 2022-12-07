import { Type, Static } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import httpErrors from "http-errors";
import getAdmin from "../../utils/admin/get.js";
import setAdmin from "../../utils/admin/set.js";
import getSuperAdmins from "../../utils/admin/supers.js";
import {
    objectIdPattern,
    passwordPattern,
    usernamePattern,
} from "../../utils/patterns.js";

const ModifyRequest = Type.Object({
    adminId: objectIdPattern,
    newUsername: Type.Optional(usernamePattern),
    newPassword: Type.Optional(passwordPattern),
    newIsSuperAdmin: Type.Optional(Type.Boolean()),
});
type ModifyRequestType = Static<typeof ModifyRequest>;

const ModifyResponse = Type.Object({
    adminId: Type.String(),
    username: Type.String(),
    passwordChanged: Type.Boolean(),
});
type ModifyResponseType = Static<typeof ModifyResponse>;

const modify = (fastify: FastifyInstance): void => {
    fastify.post<{
        Body: ModifyRequestType;
        Reply: ModifyResponseType | httpErrors.HttpError;
    }>(
        "/changeStudent",
        {
            schema: {
                body: ModifyRequest,
                response: {
                    201: ModifyResponse,
                },
            },
        },
        async (request, response) => {
            const { adminId, newUsername, newPassword, newIsSuperAdmin } =
                request.body;
            const admin = await getAdmin(adminId);
            if (!admin) {
                return response
                    .status(404)
                    .send(httpErrors.NotFound(`Admin ${adminId} not found`));
            }
            if (
                admin.isSuperAdmin &&
                newIsSuperAdmin === false &&
                (await getSuperAdmins()) <= 1
            ) {
                return response
                    .status(400)
                    .send(
                        httpErrors.BadRequest("Cannot remove last Super Admin"),
                    );
            }

            // Change Student Info
            await setAdmin(admin, {
                username: newUsername,
                password: newPassword,
                isSuperAdmin: Boolean(newIsSuperAdmin),
            });
            return response.status(201).send({
                adminId,
                username: admin.username,
                passwordChanged: newPassword !== undefined,
            });
        },
    );
};

export default modify;
