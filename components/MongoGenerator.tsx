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
  createCollection: "Create Collection",
  insertOne: "Insert One Document",
  insertMany: "Insert Many Documents",
  find: "Find Documents",
  findOne: "Find One Document",
  updateOne: "Update One Document",
  updateMany: "Update Many Documents",
  deleteOne: "Delete One Document",
  deleteMany: "Delete Many Documents",
  createIndex: "Create Index",
  aggregate: "Aggregate Pipeline",
  lookup: "Lookup (Join)",
  validation: "Add Validation",
  dropCollection: "Drop Collection",
  renameCollection: "Rename Collection",
  bulkWrite: "Bulk Write Operations",
  distinct: "Distinct Values",
  findAndModify: "Find and Modify",
  mapReduce: "Map-Reduce Operation",
  textSearch: "Text Search",
  createFunction: "Create Function",
  customQuery: "Custom Query"
};

const INDEX_TYPES = {
  single: "Single Field",
  compound: "Compound Index",
  multiKey: "MultiKey Index",
  text: "Text Index",
  geospatial: "Geospatial Index",
  hashed: "Hashed Index",
  unique: "Unique Index",
  partial: "Partial Index",
  sparse: "Sparse Index",
};

const MONGO_TYPES = [
  "String",
  "Number",
  "Date",
  "Boolean",
  "ObjectId",
  "Array",
  "Object",
  "Decimal128",
  "Binary",
  "Mixed",
];

const DEFAULT_VALUES = {
  String: '""',
  Number: "0",
  Date: "new Date()",
  Boolean: "false",
  ObjectId: "ObjectId()",
  Array: "[]",
  Object: "{}",
  Decimal128: "NumberDecimal('0')",
  Binary: "Binary('')",
  Mixed: "null",
};

interface Field {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  defaultValue: string;
  validation: string;
}

export default function MongoGenerator() {
  const { toast } = useToast();
  const [operation, setOperation] = useState("createCollection");
  const [collectionName, setCollectionName] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [indexType, setIndexType] = useState("single");
  const [indexFields, setIndexFields] = useState("");
  const [indexOptions, setIndexOptions] = useState("");
  const [pipeline, setPipeline] = useState("");
  const [sourceCollection, setSourceCollection] = useState("");
  const [targetCollection, setTargetCollection] = useState("");
  const [query, setQuery] = useState("");
  const [update, setUpdate] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [functionBody, setFunctionBody] = useState("");
  const [functionParameters, setFunctionParameters] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [aggregateFunction, setAggregateFunction] = useState("");
  const [groupByFields, setGroupByFields] = useState("");
  const [documents, setDocuments] = useState("");
  const [findQuery, setFindQuery] = useState("");
  const [findOptions, setFindOptions] = useState("");
  const [updateFilter, setUpdateFilter] = useState("");
  const [updateOperation, setUpdateOperation] = useState("");

  const addField = () => {
    setFields([...fields, {
      name: "",
      type: "String",
      required: false,
      unique: false,
      defaultValue: "",
      validation: "",
    }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: keyof Field, value: string | boolean) => {
    const newFields = [...fields];
    if (field === "type" && typeof value === "string") {
      newFields[index] = {
        ...newFields[index],
        [field]: value,
        defaultValue: DEFAULT_VALUES[value as keyof typeof DEFAULT_VALUES] || "",
      };
    } else {
      newFields[index] = { ...newFields[index], [field]: value };
    }
    setFields(newFields);
  };

  const generateMongoCode = () => {
    switch (operation) {
      case "createCollection":
        return `db.createCollection("${collectionName}", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [${fields.filter(f => f.required).map(f => `"${f.name}"`).join(", ")}],
      properties: {
        ${fields.map(field => `
        ${field.name}: {
          bsonType: "${field.type.toLowerCase()}",
          ${field.validation ? field.validation + "," : ""}
          ${field.unique ? "unique: true," : ""}
          ${field.defaultValue ? `default: ${field.defaultValue},` : ""}
          description: "${field.name} field"
        }`).join(",\n")}
      }
    }
  }
});

${fields.filter(f => f.unique).map(field => `
db.${collectionName}.createIndex({ ${field.name}: 1 }, { unique: true });`).join("\n")}`;

      case "createIndex":
        return `db.${collectionName}.createIndex(
  ${indexFields || "{ field: 1 }"},
  {
    name: "${collectionName}_index",
    ${indexType !== "single" ? `type: "${indexType}",` : ""}
    ${indexOptions}
  }
);`;

      case "lookup":
        return `db.${sourceCollection}.aggregate([
  {
    $lookup: {
      from: "${targetCollection}",
      localField: "_id",
      foreignField: "${sourceCollection}_id",
      as: "joined_data"
    }
  }
]);`;

      case "aggregate":
        return `db.${collectionName}.aggregate([
  {
    $group: {
      _id: { ${groupByFields || "field: '$field'"} },
      result: { ${aggregateFunction || "$sum: 1"} }
    }
  }
  ${pipeline ? `,\n  ${pipeline}` : ''}
]);`;

      case "createFunction":
        return `function ${functionName}(${functionParameters}) {
  ${functionBody}
}

// Store the function in the system.js collection
db.system.js.save({
  _id: "${functionName}",
  value: ${functionName}
});

// Load the function into the current session
db.loadServerScripts();`;

      case "customQuery":
        return customQuery || "// Enter your custom MongoDB query here";

      case "renameCollection":
        return `db.${collectionName}.renameCollection("${targetCollection}");`;

      case "dropCollection":
        return `db.${collectionName}.drop();`;

      case "updateDocument":
        return `db.${collectionName}.updateMany(
${query || '  // Query to match documents'},
${update || '  // Update operations'}
);`;

      case "findAndModify":
        return `db.${collectionName}.findAndModify({
  query: ${query || '// Query to find document'},
  update: ${update || '// Update operations'},
  new: true,
  upsert: true
});`;

      case "textSearch":
        return `db.${collectionName}.find({
  $text: {
    $search: "search term",
    $language: "english",
    $caseSensitive: false,
    $diacriticSensitive: false
  }
});`;

      case "insertOne":
        return `db.${collectionName}.insertOne(
  ${documents || "{ field: 'value' }"}
);`;

      case "insertMany":
        return `db.${collectionName}.insertMany([
  ${documents || "{ field: 'value1' },\n  { field: 'value2' }"}
]);`;

      case "find":
        return `db.${collectionName}.find(
  ${findQuery || "// Query object"},
  ${findOptions || "// Projection object"}
);`;

      case "findOne":
        return `db.${collectionName}.findOne(
  ${findQuery || "// Query object"},
  ${findOptions || "// Projection object"}
);`;

      case "updateOne":
        return `db.${collectionName}.updateOne(
  ${updateFilter || "// Filter criteria"},
  ${updateOperation || "// Update operations"}
);`;

      case "updateMany":
        return `db.${collectionName}.updateMany(
  ${updateFilter || "// Filter criteria"},
  ${updateOperation || "// Update operations"}
);`;

      default:
        return "// Select an operation type";
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMongoCode());
    toast({
      title: "Copied to clipboard",
      description: "MongoDB code has been copied to your clipboard",
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="grid gap-4">
          <Label>Operation Type</Label>
          <Select value={operation} onValueChange={setOperation}>
            <SelectTrigger className="w-full text-left h-auto py-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(OPERATIONS).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          <Label>Collection Name</Label>
          <Input
            placeholder="Enter collection name"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
        </div>

        {operation === "createFunction" && (
          <div className="space-y-4">
            <div className="grid gap-4">
              <Label>Function Name</Label>
              <Input
                placeholder="Enter function name"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
              />
            </div>
            <div className="grid gap-4">
              <Label>Function Parameters</Label>
              <Input
                placeholder="param1, param2, ..."
                value={functionParameters}
                onChange={(e) => setFunctionParameters(e.target.value)}
              />
            </div>
            <div className="grid gap-4">
              <Label>Function Body</Label>
              <Textarea
                placeholder="// Function implementation"
                value={functionBody}
                onChange={(e) => setFunctionBody(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </div>
        )}

        {operation === "createIndex" && (
          <div className="space-y-4">
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
            </div>
            <div className="grid gap-4">
              <Label>Index Fields</Label>
              <Textarea
                placeholder="{ field1: 1, field2: -1 }"
                value={indexFields}
                onChange={(e) => setIndexFields(e.target.value)}
              />
            </div>
            <div className="grid gap-4">
              <Label>Index Options</Label>
              <Textarea
                placeholder="unique: true,
sparse: true,
background: true"
                value={indexOptions}
                onChange={(e) => setIndexOptions(e.target.value)}
              />
            </div>
          </div>
        )}

        {operation === "aggregate" && (
          <div className="space-y-4">
            <div className="grid gap-4">
              <Label>Group By Fields</Label>
              <Input
                placeholder="field: '$fieldName'"
                value={groupByFields}
                onChange={(e) => setGroupByFields(e.target.value)}
              />
            </div>
            <div className="grid gap-4">
              <Label>Aggregate Function</Label>
              <Select
                value={aggregateFunction}
                onValueChange={setAggregateFunction}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an aggregate function" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$sum: 1">Count</SelectItem>
                  <SelectItem value="$sum: '$field'">Sum</SelectItem>
                  <SelectItem value="$avg: '$field'">Average</SelectItem>
                  <SelectItem value="$min: '$field'">Minimum</SelectItem>
                  <SelectItem value="$max: '$field'">Maximum</SelectItem>
                  <SelectItem value="$first: '$field'">First</SelectItem>
                  <SelectItem value="$last: '$field'">Last</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4">
              <Label>Additional Pipeline Stages</Label>
              <Textarea
                className="min-h-[200px]"
                placeholder="Additional aggregation pipeline stages"
                value={pipeline}
                onChange={(e) => setPipeline(e.target.value)}
              />
            </div>
          </div>
        )}

        {operation === "customQuery" && (
          <div className="grid gap-4">
            <Label>Custom Query</Label>
            <Textarea
              className="min-h-[300px]"
              placeholder="Enter your custom MongoDB query"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
            />
          </div>
        )}

        {operation === "renameCollection" && (
          <div className="grid gap-4">
            <Label>New Collection Name</Label>
            <Input
              placeholder="Enter new collection name"
              value={targetCollection}
              onChange={(e) => setTargetCollection(e.target.value)}
            />
          </div>
        )}

        {(operation === "createCollection") && (
          <div className="space-y-4">
            <div className="flex justify-center mb-8">
              <Button onClick={addField} size="lg" className="w-[200px]">
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={index} className="grid grid-cols-6 gap-4 items-center">
                <Input
                  placeholder="Field name"
                  value={field.name}
                  onChange={(e) => updateField(index, "name", e.target.value)}
                  className="col-span-1"
                />
                <Select
                  value={field.type}
                  onValueChange={(value) => updateField(index, "type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONGO_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Default value"
                  value={field.defaultValue}
                  onChange={(e) => updateField(index, "defaultValue", e.target.value)}
                  className="col-span-1"
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={field.required}
                    onCheckedChange={(checked) => updateField(index, "required", checked)}
                  />
                  <Label>Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={field.unique}
                    onCheckedChange={(checked) => updateField(index, "unique", checked)}
                  />
                  <Label>Unique</Label>
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

        {(operation === "insertOne" || operation === "insertMany") && (
          <div className="grid gap-4">
            <Label>{operation === "insertOne" ? "Document" : "Documents"}</Label>
            <Textarea
              className="min-h-[200px]"
              placeholder={operation === "insertOne" ? 
                "{ field: 'value' }" : 
                "[\n  { field: 'value1' },\n  { field: 'value2' }\n]"}
              value={documents}
              onChange={(e) => setDocuments(e.target.value)}
            />
          </div>
        )}

        {(operation === "find" || operation === "findOne") && (
          <div className="space-y-4">
            <div className="grid gap-4">
              <Label>Query</Label>
              <Textarea
                className="min-h-[150px]"
                placeholder="{ field: 'value' }"
                value={findQuery}
                onChange={(e) => setFindQuery(e.target.value)}
              />
            </div>
            <div className="grid gap-4">
              <Label>Projection (Optional)</Label>
              <Textarea
                className="min-h-[100px]"
                placeholder="{ field: 1, _id: 0 }"
                value={findOptions}
                onChange={(e) => setFindOptions(e.target.value)}
              />
            </div>
          </div>
        )}

        {(operation === "updateOne" || operation === "updateMany") && (
          <div className="space-y-4">
            <div className="grid gap-4">
              <Label>Filter Criteria</Label>
              <Textarea
                className="min-h-[150px]"
                placeholder="{ field: 'value' }"
                value={updateFilter}
                onChange={(e) => setUpdateFilter(e.target.value)}
              />
            </div>
            <div className="grid gap-4">
              <Label>Update Operations</Label>
              <Textarea
                className="min-h-[150px]"
                placeholder="{ $set: { field: 'new value' } }"
                value={updateOperation}
                onChange={(e) => setUpdateOperation(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Label>Generated MongoDB Code</Label>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>{generateMongoCode()}</code>
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