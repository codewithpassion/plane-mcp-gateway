import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../context";
import { workItemProperties } from "../resources/work_item_properties";
import type { PropertyTypeEnum, RelationTypeEnum } from "../types/common";
import type {
	CreateWorkItemPropertyOptionBody,
	PropertySettings,
} from "../types/work_item_properties";
import { toolResult } from "./_helpers";

const PROPERTY_TYPES: readonly PropertyTypeEnum[] = [
	"TEXT",
	"DATETIME",
	"DECIMAL",
	"BOOLEAN",
	"OPTION",
	"RELATION",
	"URL",
	"EMAIL",
	"FILE",
];

const RELATION_TYPES: readonly RelationTypeEnum[] = ["ISSUE", "USER"];

function asPropertyType(value: string): PropertyTypeEnum {
	if (!(PROPERTY_TYPES as readonly string[]).includes(value)) {
		throw new Error(
			`Invalid property_type '${value}'. Must be one of: ${PROPERTY_TYPES.join(", ")}`,
		);
	}
	return value as PropertyTypeEnum;
}

function asRelationType(
	value: string | undefined,
): RelationTypeEnum | undefined {
	if (!value) return undefined;
	if (!(RELATION_TYPES as readonly string[]).includes(value)) {
		throw new Error(
			`Invalid relation_type '${value}'. Must be one of: ${RELATION_TYPES.join(", ")}`,
		);
	}
	return value as RelationTypeEnum;
}

function processSettings(
	propertyType: string | undefined,
	settings: Record<string, unknown> | undefined,
): PropertySettings | undefined {
	if (!settings) return undefined;
	if (propertyType === "TEXT" || propertyType === "DATETIME") {
		return settings as PropertySettings;
	}
	return undefined;
}

function processOptions(
	options: Record<string, unknown>[] | undefined,
): CreateWorkItemPropertyOptionBody[] | undefined {
	if (!options) return undefined;
	return options.map(
		(opt) => opt as unknown as CreateWorkItemPropertyOptionBody,
	);
}

export function registerWorkItemPropertyTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_work_item_properties",
		"List work item properties for a work item type.",
		{
			project_id: z.string().describe("UUID of the project"),
			type_id: z.string().describe("UUID of the work item type"),
			params: z
				.record(z.unknown())
				.optional()
				.describe("Optional query parameters as a dictionary"),
		},
		async ({ project_id, type_id, params }) =>
			toolResult(() =>
				workItemProperties.list(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					type_id,
					params ?? null,
				),
			),
	);

	server.tool(
		"create_work_item_property",
		"Create a new work item property.",
		{
			project_id: z.string().describe("UUID of the project"),
			type_id: z.string().describe("UUID of the work item type"),
			display_name: z.string().describe("Display name for the property"),
			property_type: z
				.string()
				.describe(
					"Type of property (TEXT, DATETIME, DECIMAL, BOOLEAN, OPTION, RELATION, URL, EMAIL, FILE)",
				),
			relation_type: z
				.string()
				.optional()
				.describe(
					"Relation type (ISSUE, USER) - required for RELATION properties",
				),
			description: z.string().optional().describe("Property description"),
			is_required: z
				.boolean()
				.optional()
				.describe("Whether the property is required"),
			default_value: z
				.array(z.string())
				.optional()
				.describe("Default value(s) for the property"),
			settings: z
				.record(z.unknown())
				.optional()
				.describe(
					'Settings dictionary - required for TEXT and DATETIME properties. For TEXT: {"display_format": "single-line"|"multi-line"|"readonly"}. For DATETIME: {"display_format": "MMM dd, yyyy"|"dd/MM/yyyy"|"MM/dd/yyyy"|"yyyy/MM/dd"}',
				),
			is_active: z
				.boolean()
				.optional()
				.describe("Whether the property is active"),
			is_multi: z
				.boolean()
				.optional()
				.describe("Whether the property supports multiple values"),
			validation_rules: z
				.record(z.unknown())
				.optional()
				.describe("Validation rules dictionary"),
			external_source: z
				.string()
				.optional()
				.describe("External system source name"),
			external_id: z.string().optional().describe("External system identifier"),
			options: z
				.array(z.record(z.unknown()))
				.optional()
				.describe("List of option dictionaries for OPTION properties"),
		},
		async ({
			project_id,
			type_id,
			display_name,
			property_type,
			relation_type,
			description,
			is_required,
			default_value,
			settings,
			is_active,
			is_multi,
			validation_rules,
			external_source,
			external_id,
			options,
		}) =>
			toolResult(() =>
				workItemProperties.create(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					type_id,
					{
						display_name,
						property_type: asPropertyType(property_type),
						relation_type: asRelationType(relation_type),
						description,
						is_required,
						default_value,
						settings: processSettings(property_type, settings),
						is_active,
						is_multi,
						validation_rules,
						external_source,
						external_id,
						options: processOptions(options),
					},
				),
			),
	);

	server.tool(
		"retrieve_work_item_property",
		"Retrieve a work item property by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			type_id: z.string().describe("UUID of the work item type"),
			work_item_property_id: z.string().describe("UUID of the property"),
		},
		async ({ project_id, type_id, work_item_property_id }) =>
			toolResult(() =>
				workItemProperties.retrieve(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					type_id,
					work_item_property_id,
				),
			),
	);

	server.tool(
		"update_work_item_property",
		"Update a work item property by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			type_id: z.string().describe("UUID of the work item type"),
			work_item_property_id: z.string().describe("UUID of the property"),
			display_name: z
				.string()
				.optional()
				.describe("Display name for the property"),
			property_type: z
				.string()
				.optional()
				.describe(
					"Type of property (TEXT, DATETIME, DECIMAL, BOOLEAN, OPTION, RELATION, URL, EMAIL, FILE)",
				),
			relation_type: z
				.string()
				.optional()
				.describe(
					"Relation type (ISSUE, USER) - required when updating to RELATION",
				),
			description: z.string().optional().describe("Property description"),
			is_required: z
				.boolean()
				.optional()
				.describe("Whether the property is required"),
			default_value: z
				.array(z.string())
				.optional()
				.describe("Default value(s) for the property"),
			settings: z
				.record(z.unknown())
				.optional()
				.describe(
					'Settings dictionary - required when updating to TEXT or DATETIME. For TEXT: {"display_format": "single-line"|"multi-line"|"readonly"}. For DATETIME: {"display_format": "MMM dd, yyyy"|"dd/MM/yyyy"|"MM/dd/yyyy"|"yyyy/MM/dd"}',
				),
			is_active: z
				.boolean()
				.optional()
				.describe("Whether the property is active"),
			is_multi: z
				.boolean()
				.optional()
				.describe("Whether the property supports multiple values"),
			validation_rules: z
				.record(z.unknown())
				.optional()
				.describe("Validation rules dictionary"),
			external_source: z
				.string()
				.optional()
				.describe("External system source name"),
			external_id: z.string().optional().describe("External system identifier"),
		},
		async ({
			project_id,
			type_id,
			work_item_property_id,
			display_name,
			property_type,
			relation_type,
			description,
			is_required,
			default_value,
			settings,
			is_active,
			is_multi,
			validation_rules,
			external_source,
			external_id,
		}) =>
			toolResult(() =>
				workItemProperties.update(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					type_id,
					work_item_property_id,
					{
						display_name,
						property_type: property_type
							? asPropertyType(property_type)
							: undefined,
						relation_type: asRelationType(relation_type),
						description,
						is_required,
						default_value,
						settings:
							property_type !== undefined
								? processSettings(property_type, settings)
								: undefined,
						is_active,
						is_multi,
						validation_rules,
						external_source,
						external_id,
					},
				),
			),
	);

	server.tool(
		"delete_work_item_property",
		"Delete a work item property by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			type_id: z.string().describe("UUID of the work item type"),
			work_item_property_id: z.string().describe("UUID of the property"),
		},
		async ({ project_id, type_id, work_item_property_id }) =>
			toolResult(() =>
				workItemProperties.delete(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					type_id,
					work_item_property_id,
				),
			),
	);
}
