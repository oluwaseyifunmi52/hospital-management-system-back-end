import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './env';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SmartCare Hospital Management System API',
      version: '1.0.0',
      description: 'API documentation for SmartCare Hospital Management System',
      contact: {
        name: 'SmartCare Team',
        email: 'support@smartcare.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `${config.clientUrl}/api/v1`,
        description: 'Development server',
      },
      {
        url: 'https://api.smartcare.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
            errors: { type: 'object' },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                pages: { type: 'integer' },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'object' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['super_admin', 'patient', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'laboratory', 'radiologist', 'accountant', 'ambulance_driver', 'admin'] },
            isVerified: { type: 'boolean' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
            rememberMe: { type: 'boolean' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password', minLength: 8 },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
          },
        },
        PaginationQuery: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            search: { type: 'string' },
            sortBy: { type: 'string' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'] },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Authentication', description: 'Auth endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Doctors', description: 'Doctor management' },
      { name: 'Patients', description: 'Patient management' },
      { name: 'Appointments', description: 'Appointment scheduling' },
      { name: 'Medical Records', description: 'Medical records management' },
      { name: 'Departments', description: 'Department management' },
      { name: 'Wards', description: 'Ward management' },
      { name: 'Nursing', description: 'Nursing management' },
      { name: 'Lab', description: 'Laboratory management' },
      { name: 'Pharmacy', description: 'Pharmacy management' },
      { name: 'Radiology', description: 'Radiology management' },
      { name: 'Billing', description: 'Billing and payments' },
      { name: 'Inventory', description: 'Inventory management' },
      { name: 'Notifications', description: 'Notifications' },
      { name: 'Dashboard', description: 'Dashboard analytics' },
      { name: 'Audit Logs', description: 'Audit logging' },
      { name: 'Branches', description: 'Branch management' },
      { name: 'Staff', description: 'Staff management' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);