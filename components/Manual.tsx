"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function Manual() {
  return (
    <Card className="p-6">
      <Tabs defaultValue="sql">
        <TabsList>
          <TabsTrigger value="sql">SQL Manual</TabsTrigger>
          <TabsTrigger value="mongodb">MongoDB Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="sql" className="space-y-4">
          <h2 className="text-2xl font-bold">SQL Generator Manual</h2>
          
          <div className="space-y-4">
            <section>
              <h3 className="text-xl font-semibold">Operations</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Create Table:</strong> Generate a new table with custom columns</li>
                <li><strong>Create Table As:</strong> Create a table from a SELECT query</li>
                <li><strong>Delete Table:</strong> Generate DROP TABLE statement</li>
                <li><strong>Alter Table:</strong> Modify existing table structure</li>
                <li><strong>Create Index:</strong> Add indexes to improve query performance</li>
                <li><strong>Create View:</strong> Create a virtual table based on query results</li>
                <li><strong>Create Function:</strong> Define custom SQL functions</li>
                <li><strong>Create Trigger:</strong> Set up automatic actions on table events</li>
                <li><strong>Window Function:</strong> Use analytical functions</li>
                <li><strong>Update Table:</strong> Generate UPDATE statements</li>
                <li><strong>Pivot Table:</strong> Transform rows into columns</li>
                <li><strong>Merge Tables:</strong> Combine data from multiple tables</li>
                <li><strong>Create Temporary Table:</strong> Create temporary tables</li>
                <li><strong>Clear Table:</strong> Remove all data from a table</li>
                <li><strong>Create CTE:</strong> Write Common Table Expressions</li>
                <li><strong>Custom Query:</strong> Write custom SQL queries</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold">Data Types</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>INT:</strong> Whole numbers</li>
                <li><strong>BIGINT:</strong> Large whole numbers</li>
                <li><strong>VARCHAR(255):</strong> Variable-length text</li>
                <li><strong>TEXT:</strong> Unlimited length text</li>
                <li><strong>BOOLEAN:</strong> True/false values</li>
                <li><strong>DATE:</strong> Date values</li>
                <li><strong>TIMESTAMP:</strong> Date and time values</li>
                <li><strong>DECIMAL(10,2):</strong> Precise decimal numbers</li>
                <li><strong>UUID:</strong> Unique identifiers</li>
                <li><strong>JSONB:</strong> JSON data with indexing</li>
                <li><strong>SERIAL:</strong> Auto-incrementing integers</li>
                <li><strong>FLOAT:</strong> Floating-point numbers</li>
                <li><strong>BYTEA:</strong> Binary data</li>
                <li><strong>ARRAY:</strong> Array of values</li>
                <li><strong>REGEXP_LIKE:</strong> Regular expression matching</li>
                <li><strong>REGEXP_COUNT:</strong> Regular expression counting</li>
              </ul>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="mongodb" className="space-y-4">
          <h2 className="text-2xl font-bold">MongoDB Generator Manual</h2>
          
          <div className="space-y-4">
            <section>
              <h3 className="text-xl font-semibold">Operations</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Create Collection:</strong> Create a new collection with schema validation</li>
                <li><strong>Create Index:</strong> Add indexes for query optimization</li>
                <li><strong>Insert Document:</strong> Add new documents to a collection</li>
                <li><strong>Update Document:</strong> Modify existing documents</li>
                <li><strong>Delete Document:</strong> Remove documents from a collection</li>
                <li><strong>Aggregate:</strong> Create data aggregation pipelines</li>
                <li><strong>Lookup:</strong> Perform left outer joins</li>
                <li><strong>Validation:</strong> Add schema validation rules</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold">Data Types</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>String:</strong> Text data</li>
                <li><strong>Number:</strong> Numeric values</li>
                <li><strong>Date:</strong> Date and time values</li>
                <li><strong>Boolean:</strong> True/false values</li>
                <li><strong>ObjectId:</strong> Unique document identifiers</li>
                <li><strong>Array:</strong> Lists of values</li>
                <li><strong>Object:</strong> Embedded documents</li>
                <li><strong>Decimal128:</strong> High-precision decimals</li>
                <li><strong>Binary:</strong> Binary data</li>
                <li><strong>Mixed:</strong> Any type of data</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold">Best Practices</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use schema validation for data consistency</li>
                <li>Create indexes for frequently queried fields</li>
                <li>Use appropriate data types for better performance</li>
                <li>Consider document size limits (16MB)</li>
                <li>Use aggregation for complex data transformations</li>
              </ul>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}