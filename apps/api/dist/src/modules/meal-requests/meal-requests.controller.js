"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealRequestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const meal_requests_service_1 = require("./meal-requests.service");
const create_meal_request_dto_1 = require("./dto/create-meal-request.dto");
const list_meal_requests_dto_1 = require("./dto/list-meal-requests.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let MealRequestsController = class MealRequestsController {
    constructor(mealRequestsService) {
        this.mealRequestsService = mealRequestsService;
    }
    create(user, dto) {
        return this.mealRequestsService.create(user.sub, dto);
    }
    findById(id) {
        return this.mealRequestsService.findById(id);
    }
    list(user, query) {
        return this.mealRequestsService.list(user?.role === client_1.UserRole.CUSTOMER ? user.sub : undefined, query);
    }
};
exports.MealRequestsController = MealRequestsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_meal_request_dto_1.CreateMealRequestDto]),
    __metadata("design:returntype", void 0)
], MealRequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MealRequestsController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_meal_requests_dto_1.ListMealRequestsDto]),
    __metadata("design:returntype", void 0)
], MealRequestsController.prototype, "list", null);
exports.MealRequestsController = MealRequestsController = __decorate([
    (0, swagger_1.ApiTags)('meal-requests'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('meal-requests'),
    __metadata("design:paramtypes", [meal_requests_service_1.MealRequestsService])
], MealRequestsController);
