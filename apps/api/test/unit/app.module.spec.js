"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../../src/app.module");
describe('AppModule', () => {
    it('should compile the application context', async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        expect(moduleRef).toBeDefined();
    });
});
