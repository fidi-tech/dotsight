import { ForbiddenException, Injectable } from '@nestjs/common';
import { PipelineService } from '../pipeline/pipeline.service';
import { UserId } from '../../../users/entities/user.entity';
import { PipelineId } from '../../entities/pipeline.entity';

@Injectable()
export class PipelineAbilityService {
  constructor(private readonly pipelineService: PipelineService) {}

  private async isOwner(userId: UserId, pipelineId: PipelineId) {
    const pipeline = await this.pipelineService.findById(pipelineId);
    return pipeline.createdBy.id === userId;
  }

  private claimFailed(pipelineId: PipelineId) {
    throw new ForbiddenException(
      `You do not have access to pipeline #${pipelineId}`,
    );
  }

  async claimExecute(userId: UserId, pipelineId: PipelineId) {
    if (!(await this.isOwner(userId, pipelineId))) {
      this.claimFailed(pipelineId);
    }
  }

  async claimRead(userId: UserId, pipelineId: PipelineId) {
    if (!(await this.isOwner(userId, pipelineId))) {
      this.claimFailed(pipelineId);
    }
  }

  async claimModify(userId: UserId, pipelineId: PipelineId) {
    if (!(await this.isOwner(userId, pipelineId))) {
      this.claimFailed(pipelineId);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  async claimCreate(userId: UserId) {}
}
