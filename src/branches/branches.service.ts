import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  // Calculate distance using Haversine formula (in KM)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

// Create a new branch
  async createBranch(data: { name: string; latitude: number; longitude: number; radiusKm?: number; address?: string; restaurantId?: string }) {
    let restaurantId = data.restaurantId;

    // إذا لم يتم إرسال restaurantId، يتم جلب أو إنشاء مطعم افتراضي
    if (!restaurantId) {
      const defaultRestaurant = await this.prisma.restaurant.findFirst();
      if (defaultRestaurant) {
        restaurantId = defaultRestaurant.id;
      } else {
        const newRestaurant = await this.prisma.restaurant.create({
          data: { name: 'B.Laban' },
        });
        restaurantId = newRestaurant.id;
      }
    }

    return this.prisma.branch.create({
      data: {
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        radiusKm: data.radiusKm ?? 3.0,
        address: data.address ?? 'Default Branch Address',
        restaurant: {
          connect: { id: restaurantId },
        },
      },
    });
  }

  // Fetch all branches
  async getAllBranches() {
    return this.prisma.branch.findMany();
  }

  // Validate user location against branch geofence
  // Validate user location against branch geofence
  async validateUserLocation(branchId: string, userLat: number, userLon: number) {
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const distance = this.calculateDistance(userLat, userLon, branch.latitude, branch.longitude);
    const isWithinFence = distance <= branch.radiusKm;

    return {
      branchName: branch.name,
      distanceKm: distance,
      distanceMeters: Math.round(distance * 1000), // حساب المسافة الدقيقة بالأمتار
      allowedRadiusKm: branch.radiusKm,
      allowedRadiusMeters: branch.radiusKm * 1000,
      isWithinFence,
    };
  }
}