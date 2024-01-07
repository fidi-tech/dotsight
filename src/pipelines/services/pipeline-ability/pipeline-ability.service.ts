import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PipelineService } from '../pipeline/pipeline.service';
import { UserId } from '../../../users/entities/user.entity';
import { Pipeline, PipelineId } from '../../entities/pipeline.entity';

@Injectable()
export class PipelineAbilityService {
  constructor(
    @Inject(forwardRef(() => PipelineService))
    private readonly pipelineService: PipelineService,
  ) {}

  private isOwner(userId: UserId, pipeline: Readonly<Pipeline>) {
    return pipeline.createdBy.id === userId;
  }

  private isOwnerOrPublic(userId: UserId, pipeline: Readonly<Pipeline>) {
    return pipeline.createdBy.id === userId || pipeline.isPublic;
  }

  private canExecute(userId: UserId, pipeline: Readonly<Pipeline>) {
    return this.isOwnerOrPublic(userId, pipeline);
  }

  private canModify(userId: UserId, pipeline: Readonly<Pipeline>) {
    return this.isOwner(userId, pipeline);
  }

  private canRead(userId: UserId, pipeline: Readonly<Pipeline>) {
    return this.isOwnerOrPublic(userId, pipeline);
  }

  private claimFailed(pipelineId: PipelineId) {
    throw new ForbiddenException(
      `You do not have access to pipeline #${pipelineId}`,
    );
  }

  async claimExecute(userId: UserId, pipelineId: PipelineId) {
    const pipeline = await this.pipelineService.findById(pipelineId);

    if (!this.canExecute(userId, pipeline)) {
      this.claimFailed(pipelineId);
    }
  }

  async claimRead(userId: UserId, pipelineId: PipelineId) {
    const pipeline = await this.pipelineService.findById(pipelineId);

    if (!this.canRead(userId, pipeline)) {
      this.claimFailed(pipelineId);
    }
  }

  async claimModify(userId: UserId, pipelineId: PipelineId) {
    const pipeline = await this.pipelineService.findById(pipelineId);

    if (!this.canModify(userId, pipeline)) {
      this.claimFailed(pipelineId);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  async claimCreate(userId: UserId) {}

  addAbilities(userId: UserId, pipeline: Pipeline) {
    pipeline.canExecute = this.canExecute(userId, pipeline);
    pipeline.canModify = this.canModify(userId, pipeline);
  }
}
