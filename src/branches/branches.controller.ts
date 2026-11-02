import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('branches')
export class BranchesController {
  constructor(private branchesService: BranchesService) {}

  // Create a new branch (JWT Protected)
  @UseGuards(JwtAuthGuard)
  @Post()
  async createBranch(
    @Body() body: { name: string; latitude: number; longitude: number; radiusKm?: number; address?: string },
  ) {
    return this.branchesService.createBranch(body);
  }

  // Get all branches
  @Get()
  async getAllBranches() {
    return this.branchesService.getAllBranches();
  }

  // Validate user location against branch geofence
  @Post(':id/validate-location')
  async validateLocation(
    @Param('id') branchId: string,
    @Body() body: { latitude: number; longitude: number },
  ) {
    return this.branchesService.validateUserLocation(branchId, body.latitude, body.longitude);
  }
}