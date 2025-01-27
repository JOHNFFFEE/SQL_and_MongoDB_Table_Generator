"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const OPERATIONS = {
  createTable: "Create Table",
  createTableAs: "Create Table As",
  deleteTable: "Delete Table",
  alterTable: "Alter Table",
  createIndex: "Create Index",
  createView: "Create View",
  createFunction: "Create Function",
  createTrigger: "Create Trigger",
  windowFunction: "Window Function",
  updateTable: "Update Table",
  pivotTable: "Pivot Table",
  mergeTable: "Merge Tables",
  tempTable: "Create Temporary Table",
  clearTable: "Clear Table",
  cte: "Create CTE",
  query: "Custom Query"
};

const ALTER_OPERATIONS = {
  addColumn: "Add Column",
  modifyColumn: "Modify Column",
  renameColumn: "Rename Column",
  dropColumn: "Drop Column",
  addConstraint: "Add Constraint",
  dropConstraint: "Drop Constraint",
  renameTable: "Rename Table"
};

const INDEX_TYPES = {
  btree: "B-tree",
  hash: "Hash",
  gist: "GiST",
  gin: "GIN",
  brin: "BRIN"
};

const TRIGGER_EVENTS = {
  before_insert: "BEFORE INSERT",
  after_insert: "AFTER INSERT",
  before_update: "BEFORE UPDATE",
  after_update: "AFTER UPDATE",
  before_delete: "BEFORE DELETE",
  after_delete: "AFTER DELETE"
};

const SQL_TYPES = [
  "INT",
  "BIGINT",
  "VARCHAR(255)",
  "TEXT",
  "BOOLEAN",
  "DATE",
  "TIMESTAMP",
  "DECIMAL(10,2)",
  "UUID",
  "JSONB",
  "SERIAL",
  "FLOAT",
  "BYTEA",
  "ARRAY",
  "REGEXP_LIKE",
  "REGEXP_COUNT"
];

const DEFAULT_VALUES = {
  INT: "0",
  BIGINT: "0",
  "VARCHAR(255)": "''",
  TEXT: "''",
  BOOLEAN: "false",
  DATE: "CURRENT_DATE",
  TIMESTAMP: "CURRENT_TIMESTAMP",
  "DECIMAL(10,2)": "0.00",
  UUID: "gen_random_uuid()",
  JSONB: "'{}'",
  SERIAL: null,
  FLOAT: "0.0",
  BYTEA: "''",
  ARRAY: "'{}'",
};

interface Column {
  name: string;
  type: string;
  required: boolean;
  isPrimaryKey: boolean;
  isAutoIncrement: boolean;
  defaultValue: string;
}

export default function SQLGenerator() {
  const { toast } = useToast();
  const [operation, setOperation] = useState("createTable");
  const [alterOperation, setAlterOperation] = useState("addColumn");
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState<Column[]>([]);
  const [sourceQuery, setSourceQuery] = useState("");
  const [oldColumnName, setOldColumnName] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [viewName, setViewName] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [functionBody, setFunctionBody] = useState("");
  const [triggerName, setTriggerName] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("before_insert");
  const [triggerBody, setTriggerBody] = useState("");
  const [indexType, setIndexType] = useState("btree");
  const [indexColumns, setIndexColumns] = useState("");
  const [mergeCondition, setMergeCondition] = useState("");
  const [pivotColumns, setPivotColumns] = useState("");
  const [aggregateFunction, setAggregateFunction] = useState("");
  const [whereClause, setWhereClause] = useState("");
  const [cteQuery, setCteQuery] = useState("");
  const [mainQuery, setMainQuery] = useState("");

  const addColumn = () => {
    setColumns([...columns, {
      name: "",
      type: "VARCHAR(255)",
      required: false,
      isPrimaryKey: false,
      isAutoIncrement: false,
      defaultValue: ""
    }]);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const updateColumn = (index: number, field: keyof Column, value: string | boolean) => {
    const newColumns = [...columns];
    if (field === "type" && typeof value === "string") {
      newColumns[index] = {
        ...newColumns[index],
        [field]: value,
        defaultValue: DEFAULT_VALUES[value as keyof typeof DEFAULT_VALUES] || ""
      };
    } else {
      newColumns[index] = { ...newColumns[index], [field]: value };
    }
    setColumns(newColumns);
  };

  const generateSQL = () => {
    switch (operation) {
      case "createTable":
        return `CREATE TABLE ${tableName} (
  ${columns.map(col => {
    const parts = [
      col.name,
      col.isAutoIncrement ? "SERIAL" : col.type,
      col.required ? "NOT NULL" : "",
      col.isPrimaryKey ? "PRIMARY KEY" : "",
      col.defaultValue && !col.isAutoIncrement ? `DEFAULT ${col.defaultValue}` : ""
    ].filter(Boolean);
    return parts.join(" ");
  }).join(",\n  ")}
);   ` ;

      case "createView":
        return `CREATE OR REPLACE VIEW ${viewName} AS
${sourceQuery};`;

      case "createFunction":
        return `CREATE OR REPLACE FUNCTION ${functionName}()
RETURNS TRIGGER AS $$
BEGIN
${functionBody}
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`;

      case "createTrigger":
        return `CREATE TRIGGER ${triggerName}
${TRIGGER_EVENTS[triggerEvent as keyof typeof TRIGGER_EVENTS]}
ON ${tableName}
FOR EACH ROW
EXECUTE FUNCTION ${functionName}();`;

      case "createIndex":
        return `CREATE INDEX ${tableName}_idx
ON ${tableName} USING ${indexType}
(${indexColumns});`;

      case "mergeTable":
        return `MERGE INTO ${tableName} AS target
USING ${sourceQuery} AS source
ON ${mergeCondition}
WHEN MATCHED THEN
  UPDATE SET ${columns.map(col => `${col.name} = source.${col.name}`).join(", ")}
WHEN NOT MATCHED THEN
  INSERT (${columns.map(col => col.name).join(", ")})
  VALUES (${columns.map(col => `source.${col.name}`).join(", ")});`;

      case "pivotTable":
        return `SELECT *
FROM  ${tableName} (
  '${sourceQuery}',
  'SELECT DISTINCT ${pivotColumns} FROM ${tableName} ORDER BY 1'
) AS ct (
  ${columns.map(col => `${col.name} ${col.type}`).join(",\n  ")}
);`;

      case "cte":
        return `WITH  cte_${tableName} AS (
  ${cteQuery}
)
${mainQuery};`;

      case "windowFunction":
        return `SELECT ${columns.map(col => col.name).join(", ")},
  ${aggregateFunction} OVER (
    PARTITION BY ${columns[0]?.name || "partition_column"}
    ORDER BY ${columns[1]?.name || "order_column"}
  ) as window_result
FROM ${tableName}
${whereClause ? `WHERE ${whereClause}` : ""};`;

      case "alterTable":
        switch (alterOperation) {
          case "addColumn":
            return columns.map(col => 
              `ALTER TABLE ${tableName}
ADD COLUMN ${col.name} ${col.type}${col.required ? ' NOT NULL' : ''}${col.defaultValue ? ` DEFAULT ${col.defaultValue}` : ''};`
            ).join("\n\n");
          
          case "modifyColumn":
            return columns.map(col =>
              `ALTER TABLE ${tableName}
ALTER COLUMN ${col.name} TYPE ${col.type}${col.required ? ',\nALTER COLUMN ${col.name} SET NOT NULL' : ''}${col.defaultValue ? `,\nALTER COLUMN ${col.name} SET DEFAULT ${col.defaultValue}` : ''};`
            ).join("\n\n");
          
          case "renameColumn":
            return `ALTER TABLE ${tableName}
RENAME COLUMN ${oldColumnName} TO ${newColumnName};`;
          
          case "dropColumn":
            return `ALTER TABLE ${tableName}
DROP COLUMN IF EXISTS ${columns[0]?.name};`;
          
          default:
            return "-- Select an alter operation";
        }

      case "createTableAs":
        return `CREATE TABLE ${tableName} AS (${sourceQuery}) ;`;

      case "deleteTable":
        return `DROP TABLE  ${tableName};`;

      case "clearTable":
        return `TRUNCATE TABLE ${tableName} ;`;

      case "tempTable":
        return `CREATE TEMPORARY TABLE ${tableName} (
  ${columns.map(col => `${col.name} ${col.type}${col.required ? ' NOT NULL' : ''}${col.defaultValue ? ` DEFAULT ${col.defaultValue}` : ''}`).join(",\n  ")}
);`;

      default:
        return "-- Select an operation type";
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateSQL());
    toast({
      title: "Copied to clipboard",
      description: "SQL code has been copied to your clipboard",
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="grid gap-4">
          <Label>Operation Type</Label>
          <Select value={operation} onValueChange={setOperation}>
            <SelectTrigger className="h-20 items-start">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(OPERATIONS).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {operation === "alterTable" && (
          <div className="grid gap-4">
            <Label>Alter Operation</Label>
            <Select value={alterOperation} onValueChange={setAlterOperation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ALTER_OPERATIONS).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid gap-4">
          <Label>Table Name</Label>
          <Input
            placeholder="Enter table name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
        </div>

        {operation === "createView" && (
          <div className="grid gap-4">
            <Label>View Name</Label>
            <Input
              placeholder="Enter view name"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
            />
            <Label>View Query</Label>
            <Textarea
              placeholder="SELECT * FROM table WHERE condition"
              value={sourceQuery}
              onChange={(e) => setSourceQuery(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
        )}

        {operation === "createFunction" && (
          <div className="grid gap-4">
            <Label>Function Name</Label>
            <Input
              placeholder="Enter function name"
              value={functionName}
              onChange={(e) => setFunctionName(e.target.value)}
            />
            <Label>Function Body</Label>
            <Textarea
              placeholder="-- Function logic here"
              value={functionBody}
              onChange={(e) => setFunctionBody(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
        )}

        {operation === "createTrigger" && (
          <div className="grid gap-4">
            <Label>Trigger Name</Label>
            <Input
              placeholder="Enter trigger name"
              value={triggerName}
              onChange={(e) => setTriggerName(e.target.value)}
            />
            <Label>Trigger Event</Label>
            <Select value={triggerEvent} onValueChange={setTriggerEvent}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TRIGGER_EVENTS).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label>Trigger Body</Label>
            <Textarea
              placeholder="-- Trigger logic here"
              value={triggerBody}
              onChange={(e) => setTriggerBody(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
        )}

        {operation === "createIndex" && (
          <div className="grid gap-4">
            <Label>Index Type</Label>
            <Select value={indexType} onValueChange={setIndexType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INDEX_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label>Index Columns</Label>
            <Input
              placeholder="column1, column2 DESC"
              value={indexColumns}
              onChange={(e) => setIndexColumns(e.target.value)}
            />
          </div>
        )}

        {(operation === "createTable" || (operation === "alterTable" && ["addColumn", "modifyColumn"].includes(alterOperation))) && (
          <div className="space-y-4">
            <div className="flex justify-center mb-8">
              <Button onClick={addColumn} size="lg" className="w-[200px]">
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </Button>
            </div>

            {columns.map((column, index) => (
              <div key={index} className="grid grid-cols-6 gap-4 items-center">
                <Input
                  placeholder="Column name"
                  value={column.name}
                  onChange={(e) => updateColumn(index, "name", e.target.value)}
                  className="col-span-1"
                />
                <Select
                  value={column.type}
                  onValueChange={(value) => updateColumn(index, "type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SQL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Default value"
                  value={column.defaultValue}
                  onChange={(e) => updateColumn(index, "defaultValue", e.target.value)}
                  className="col-span-1"
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={column.required}
                    onCheckedChange={(checked) => updateColumn(index, "required", checked)}
                  />
                  <Label>Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={column.isPrimaryKey}
                    onCheckedChange={(checked) => updateColumn(index, "isPrimaryKey", checked)}
                  />
                  <Label>Primary Key</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={column.isAutoIncrement}
                    onCheckedChange={(checked) => updateColumn(index, "isAutoIncrement", checked)}
                    disabled={column.type !== "INT" && column.type !== "BIGINT"}
                  />
                  <Label>Auto-increment</Label>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeField(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {operation === "alterTable" && alterOperation === "renameColumn" && (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Old Column Name</Label>
                <Input
                  placeholder="Enter old column name"
                  value={oldColumnName}
                  onChange={(e) => setOldColumnName(e.target.value)}
                />
              </div>
              <div>
                <Label>New Column Name</Label>
                <Input
                  placeholder="Enter new column name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {(operation === "createTableAs" || operation === "mergeTable") && (
          <div className="grid gap-4">
            <Label>Source Query</Label>
            <Textarea
              className="min-h-[200px]"
              placeholder="SELECT * FROM source_table"
              value={sourceQuery}
              onChange={(e) => setSourceQuery(e.target.value)}
            />
            {operation === "mergeTable" && (
              <>
                <Label>Merge Condition</Label>
                <Input
                  placeholder="target.id = source.id"
                  value={mergeCondition}
                  onChange={(e) => setMergeCondition(e.target.value)}
                />
              </>
            )}
          </div>
        )}

        {operation === "pivotTable" && (
          <div className="grid gap-4">
            <Label>Pivot Columns</Label>
            <Input
              placeholder="column_to_pivot"
              value={pivotColumns}
              onChange={(e) => setPivotColumns(e.target.value)}
            />
            <Label>Source Query</Label>
            <Textarea
              className="min-h-[200px]"
              placeholder="SELECT * FROM source_table"
              value={sourceQuery}
              onChange={(e) => setSourceQuery(e.target.value)}
            />
          </div>
        )}

        {operation === "cte" && (
          <div className="grid gap-4">
            <Label>CTE Query</Label>
            <Textarea
              className="min-h-[150px]"
              placeholder="SELECT * FROM initial_table"
              value={cteQuery}
              onChange={(e) => setCteQuery(e.target.value)}
            />
            <Label>Main Query</Label>
            <Textarea
              className="min-h-[150px]"
              placeholder="SELECT * FROM cte"
              value={mainQuery}
              onChange={(e) => setMainQuery(e.target.value)}
            />
          </div>
        )}

        {operation === "windowFunction" && (
          <div className="grid gap-4">
            <Label>Aggregate Function</Label>
            <Input
              placeholder="SUM(amount)"
              value={aggregateFunction}
              onChange={(e) => setAggregateFunction(e.target.value)}
            />
            <Label>Where Clause</Label>
            <Input
              placeholder="amount > 1000"
              value={whereClause}
              onChange={(e) => setWhereClause(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-4">
          <Label>Generated SQL</Label>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>{generateSQL()}</code>
            </pre>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2"
              onClick={copyToClipboard}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}