import { Controller, Get, Body, Put } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  updateSettings(@Body() data: any) {
    return this.settingsService.updateSettings(data);
  }
}