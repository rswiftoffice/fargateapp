import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { User } from 'src/core/auth/entity/loggedInUser.entity';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/auth/roles/roles.guard';
import { Roles } from 'src/core/auth/roles/roles.decorator';
import { UsersService } from './users.service';
import { Role } from '.prisma/client';
import { FirebaseService } from '../firebase/firebase.service';
import {
  CreateUserDto,
  FindUsersDto,
  SubscribeTokenDto,
  UpdateUserDto,
} from './dto/user.dto';
import { RequestedUser, UserListResults } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Get('me')
  @ApiOkResponse({ type: User })
  getProfile(@Request() req: ExpressRequest) {
    const user = { ...req.user } as any;
    delete user.deleted;
    return user;
  }

  /**
   * List All Users
   * GET /users
   */
  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  @ApiOkResponse({
    description: 'Get list users successfully!',
    type: UserListResults,
  })
  async getUsers(@Request() req: ExpressRequest, @Query() query: FindUsersDto) {
    const user = { ...req.user } as any;
    return await this.usersService.findAll(query, user);
  }

  /**
   * List All Users
   * GET /users/list-drivers
   */
  @Get('list-drivers')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  @ApiOkResponse({
    description: 'Get list drivers successfully!',
    type: UserListResults,
  })
  async getDriversList() {
    return await this.usersService.findDriverRoleUsers();
  }

  @Roles(Role.DRIVER)
  @Get('approving-officers')
  @ApiQuery({
    name: 'name',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
  })
  async getApprovingOfficers(
    @Request() req: ExpressRequest,
    @Query('name') name: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return await this.usersService.getApprovingOfficers(
      name,
      limit,
      offset,
      req,
    );
  }

  /**
   * Get User Details
   * GET /users/:id
   */
  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  @ApiOkResponse({
    description: 'Get user detail successfully!',
    type: RequestedUser,
  })
  async getUserDetail(@Param() { id }) {
    return await this.usersService.findById(Number(id));
  }

  /**
   * Update User Information
   * PUT /users/:id
   */
  @Put(':id')
  @ApiParam({
    name: 'id',
    required: true,
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  @ApiOkResponse({
    description: 'Update user successfully!',
    type: RequestedUser,
  })
  async updateUser(@Param() { id }, @Body() data: UpdateUserDto) {
    return await this.usersService.updateUser(Number(id), data);
  }

  /**
   * Delete an user
   * PUT /users/:id
   */
  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.BASE, Role.SERVICES, Role.SUB_UNIT)
  @ApiOkResponse({
    description: 'User deleted successfully!',
    type: Boolean,
  })
  async deleteUser(@Param() { id }) {
    return await this.usersService.deleteUser(Number(id));
  }

  // @Roles(Role.BASE)
  @Post('me/fcm/subscribe')
  @ApiOkResponse({ type: Boolean })
  async subscribeToken(
    @Body() tokenData: SubscribeTokenDto,
    @Request() { user },
  ) {
    try {
      const isSubscribeTokenToTopic =
        await this.firebaseService.subscribeTokenToTopic({
          tokens: [tokenData.token],
          topic: `User-${user.id}`,
        });

      return isSubscribeTokenToTopic;
    } catch (error) {
      throw error;
    }
  }

  // @Roles(Role.BASE)
  @Post('me/fcm/unsubscribe')
  @ApiOkResponse({ type: Boolean })
  async unsubscribeToken(
    @Body() tokenData: SubscribeTokenDto,
    @Request() { user },
  ) {
    try {
      const isSubscribeTokenToTopic =
        await this.firebaseService.unsubscribeTokenFromTopic({
          tokens: [tokenData.token],
          topic: `User-${user.id}`,
        });

      return isSubscribeTokenToTopic;
    } catch (error) {
      throw error;
    }
  }

  @Post('')
  @ApiBody({ type: CreateUserDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES, Role.BASE, Role.SUB_UNIT)
  @ApiOkResponse({
    description: 'create user successfully!',
    type: RequestedUser,
  })
  async createUser(@Body() data: CreateUserDto) {
    return await this.usersService.createOne(data);
  }
}
