import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ListMenusDto } from './dto/list-menus.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('menus')
@ApiBearerAuth()
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @Public()
  list(@CurrentUser() user: RequestUser, @Query() query: ListMenusDto) {
    return this.menusService.list(user?.sub, query);
  }

  @Post()
  @Roles(UserRole.VENDOR)
  createMenu(@CurrentUser() user: RequestUser, @Body() dto: CreateMenuDto) {
    return this.menusService.createMenu(user.sub, dto);
  }

  @Post(':id/items')
  @Roles(UserRole.VENDOR)
  createMenuItem(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: CreateMenuItemDto,
  ) {
    return this.menusService.createMenuItem(user.sub, id, dto);
  }

  @Patch('items/:id')
  @Roles(UserRole.VENDOR)
  updateMenuItem(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menusService.updateMenuItem(user.sub, id, dto);
  }
}
