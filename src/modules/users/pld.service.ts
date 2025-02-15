import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PLDDTO } from './interfaces/pld.dto';
import { PLDResponse } from './interfaces/pldResponse.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PLDService {
  constructor(private readonly httpService: HttpService) {}

  async verifyUser(data: PLDDTO): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.httpService.post<PLDResponse>(
          `${process.env.PLD_ENDPOINT}/check-blacklist`,
          {
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
          },
        ),
      );

      return res.data.is_in_blacklist;
    } catch {
      throw new Error('PLD Service unavailable');
    }
  }
}
