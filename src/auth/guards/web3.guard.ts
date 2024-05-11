import { Injectable } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

@Injectable()
export class Web3Guard extends PassportAuthGuard(['web3']) {}
