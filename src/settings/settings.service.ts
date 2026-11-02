import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.settings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await this.prisma.settings.create({
        data: { id: 'default' },
      });
    }

    return settings;
  }

  async updateSettings(data: any) {
    return this.prisma.settings.upsert({
      where: { id: 'default' },
      update: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        welcomeMessageAr: data.welcomeMessageAr,
        welcomeMessageEn: data.welcomeMessageEn,
        gameSettingsJson: data.gameSettingsJson ? JSON.stringify(data.gameSettingsJson) : undefined,
      },
      create: {
        id: 'default',
        ...data,
        gameSettingsJson: data.gameSettingsJson ? JSON.stringify(data.gameSettingsJson) : '[]',
      },
    });
  }
}