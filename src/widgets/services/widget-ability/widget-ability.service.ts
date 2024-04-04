import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserId } from '../../../users/entities/user.entity';
import { WidgetService } from '../widget/widget.service';
import { Widget, WidgetId } from '../../entities/widget.entity';

@Injectable()
export class WidgetAbilityService {
  constructor(
    @Inject(forwardRef(() => WidgetService))
    private readonly widgetService: WidgetService,
  ) {}

  private isOwner(userId: UserId | null, widget: Readonly<Widget>) {
    return userId !== undefined && widget.createdBy.id === userId;
  }

  private isOwnerOrPublic(userId: UserId | null, widget: Readonly<Widget>) {
    return this.isOwner(userId, widget) || widget.isPublic;
  }

  private canExecute(userId: UserId | null, widget: Readonly<Widget>) {
    return this.isOwnerOrPublic(userId, widget);
  }

  private canModify(userId: UserId | null, widget: Readonly<Widget>) {
    return this.isOwner(userId, widget);
  }

  private canRead(userId: UserId | null, widget: Readonly<Widget>) {
    return this.isOwnerOrPublic(userId, widget);
  }

  private canDelete(userId: UserId | null, widget: Readonly<Widget>) {
    return this.isOwner(userId, widget);
  }

  private claimFailed(widgetId: WidgetId) {
    throw new ForbiddenException(
      `You do not have access to widget #${widgetId}`,
    );
  }

  async claimExecute(userId: UserId | null, widgetId: WidgetId) {
    const widget = await this.widgetService.findById(widgetId);

    if (!this.canExecute(userId, widget)) {
      this.claimFailed(widgetId);
    }
  }

  async claimRead(userId: UserId | null, widgetId: WidgetId) {
    const widget = await this.widgetService.findById(widgetId);

    if (!this.canRead(userId, widget)) {
      this.claimFailed(widgetId);
    }
  }

  async claimModify(userId: UserId | null, widgetId: WidgetId) {
    const widget = await this.widgetService.findById(widgetId);

    if (!this.canModify(userId, widget)) {
      this.claimFailed(widgetId);
    }
  }

  async claimDelete(userId: UserId | null, widgetId: WidgetId) {
    const widget = await this.widgetService.findById(widgetId);

    if (!this.canDelete(userId, widget)) {
      this.claimFailed(widgetId);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  async claimCreate(userId: UserId | null) {}

  addAbilities(userId: UserId | null, widget: Widget) {
    widget.canExecute = this.canExecute(userId, widget);
    widget.canModify = this.canModify(userId, widget);
    widget.canDelete = this.canDelete(userId, widget);
  }
}
