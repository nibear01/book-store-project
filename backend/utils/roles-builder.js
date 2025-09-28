// RolesBuilder: a focused builder for constructing and validating user roles
import User from "../models/user-model.js";
const ALLOWED_ROLES = [
    "user",
    "admin",
    "book_manager",
    "order_manager",
    "printing_manager",
    "delivery_manager",
    "finance_manager",
    "customer_support",
    "marketing_manager",
];

// const ALLOWED_ROLES = User.schema.path("roles").enum;

export class RolesBuilder {
    constructor() {
        this._roles = new Set();
        this._currentUserId = null;
        this._targetUser = null;
    }

    withExisting(existing) {
        const roles = Array.isArray(existing)
            ? existing
            : Array.isArray(existing?.roles)
                ? existing.roles
                : existing?.role
                    ? [existing.role]
                    : [];
        roles.forEach((r) => this._roles.add(r));
        this._targetUser = existing && existing._id ? existing : this._targetUser;
        return this;
    }

    withActor(userId) {
        this._currentUserId = userId || null;
        return this;
    }

    set(...roles) {
        this._roles = new Set(roles.flat());
        return this;
    }

    add(...roles) {
        roles.flat().forEach((r) => this._roles.add(r));
        return this;
    }

    remove(...roles) {
        roles.flat().forEach((r) => this._roles.delete(r));
        return this;
    }

    enforce() {
        // Validate allowed roles
        for (const r of this._roles) {
            if (!ALLOWED_ROLES.includes(r)) {
                throw new Error(`Invalid role: ${r}`);
            }
        }

        // Prevent duplicates (Set already ensures) and always ensure at least user
        if (this._roles.size === 0) this._roles.add("user");

        // Business rules that mirror admin-middleware safeguards
        const targetIsAdmin = this._roles.has("admin");
        if (this._currentUserId && this._targetUser && this._targetUser._id) {
            const sameUser = String(this._targetUser._id) === String(this._currentUserId);
            if (sameUser) {
                // Prevent self role change
                throw new Error("You cannot change your own roles");
            }
        }

        // Prevent changing roles of another admin (if target currently admin but new set removes it)
        if (this._targetUser) {
            const targetExisting = Array.isArray(this._targetUser.roles)
                ? this._targetUser.roles
                : this._targetUser.role
                    ? [this._targetUser.role]
                    : [];
            const wasAdmin = targetExisting.includes("admin");
            if (wasAdmin && !targetIsAdmin) {
                throw new Error("You cannot change roles of another admin");
            }
        }

        return this;
    }

    build() {
        return Array.from(this._roles);
    }
}

export const allowedRoles = ALLOWED_ROLES;


