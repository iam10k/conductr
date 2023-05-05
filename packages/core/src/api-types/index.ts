import { APIInteractionDataResolvedGuildMember, APIUser } from 'discord-api-types/v10';

/**
 * Convenience type for a command option of guild member and user type
 */
export interface MemberUser {
  member: APIInteractionDataResolvedGuildMember | null;
  user: APIUser | null;
}
