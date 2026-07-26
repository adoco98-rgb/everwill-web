import type { User } from "../../drizzle/schema";

export function toAuthUser(user: User | null) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    loginMethod: user.loginMethod,
    role: user.role,
    createdAt: user.createdAt,
    lastSignedIn: user.lastSignedIn,
    phone: user.phone,
    birthDate: user.birthDate,
    country: user.country,
    profileCompleted: user.profileCompleted,
    address: user.address,
    zipCode: user.zipCode,
    stateProvince: user.stateProvince,
    nationality: user.nationality,
    furigana: user.furigana,
    religion: user.religion,
    occupation: user.occupation,
    assetScale: user.assetScale,
    nameKo: user.nameKo,
    nameEn: user.nameEn,
  };
}
