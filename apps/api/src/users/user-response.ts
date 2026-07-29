import { Prisma } from '@prisma/client';

export const userProfileInclude = {
  company: true,
  availableEquipment: {
    include: {
      equipment: {
        include: {
          company: true,
        },
      },
    },
  },
} satisfies Prisma.UserInclude;

export type UserProfileRecord = Prisma.UserGetPayload<{
  include: typeof userProfileInclude;
}>;

export function mapUserProfile(user: UserProfileRecord) {
  const availableEquipment = user.availableEquipment.map(({ equipment }) => ({
    id: equipment.id,
    name: equipment.name,
    serialNumber: equipment.serialNumber,
    brand: equipment.brand,
    model: equipment.model,
    installationDate: equipment.installationDate,
    warrantyExpiry: equipment.warrantyExpiry,
    companyId: equipment.companyId,
    companyName: equipment.company?.name ?? null,
  }));

  const availableBrands = Array.from(
    new Set(
      availableEquipment
        .map((equipment) => equipment.brand)
        .filter((brand): brand is string => Boolean(brand)),
    ),
  );

  const availableModels = Array.from(
    new Set(
      availableEquipment
        .map((equipment) => equipment.model)
        .filter((model): model is string => Boolean(model)),
    ),
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId,

    profileImage: user.profileImage,

    company: user.company
      ? {
          id: user.company.id,
          name: user.company.name,
          email: user.company.email,
          address: user.company.address,
          phone: user.company.phone,
          logoUrl: user.company.logoUrl,

          contactName: user.company.contactName,
          contactEmail: user.company.contactEmail,
          contactPhone: user.company.contactPhone,
          contactPosition: user.company.contactPosition,

          escalatingName: user.company.escalatingName,
          escalatingEmail: user.company.escalatingEmail,
          escalatingPhone: user.company.escalatingPhone,
          escalatingPosition: user.company.escalatingPosition,
        }
      : null,
    availableBrands,
    availableModels,
    availableEquipment,
    createdAt: user.createdAt,
  };
}
