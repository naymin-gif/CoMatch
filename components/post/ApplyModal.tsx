"use client";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"; 
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"; 
import { useState } from "react";
import { RoleAndPosition } from "./PostCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ApplyModalProps {
    rolesAndPositions: RoleAndPosition[];
    onApply: () => void;
    onCancel: () => void;
}

export default function ApplyModal({
    rolesAndPositions,
    onApply,
    onCancel,
} : ApplyModalProps) {
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const onCheckChange = (role: string, isChecked: boolean) => {
        setSelectedRoles(prevRoles => 
            isChecked 
                ? [...prevRoles, role] 
                : prevRoles.filter(r => r !== role)
        );
    };

    return (
        <Card className="w-2xl bg-comatch-background p-6">
            <CardHeader className="border-b text-center justify-center">
                <CardTitle className="text-heading">
                    Join the Team
                </CardTitle>
            </CardHeader>
            <CardContent>
                <span>Select the roles you want to apply for.</span>
                <Table className="mb-3">
                    <TableHeader>
                        <TableHead>Roles</TableHead>
                        <TableHead>Positions</TableHead>
                        <TableHead></TableHead>
                    </TableHeader>
                    <TableBody>
                        {rolesAndPositions.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.role}</TableCell>
                                <TableCell>{item.position}</TableCell>
                                <TableCell>
                                    <Checkbox 
                                        checked={selectedRoles.includes(item.role)}
                                        onCheckedChange={(checked) => onCheckChange(item.role, checked as boolean)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Include a Note  */}
                <span className="font-heading">Message</span>
                <Textarea placeholder="Say something to your teammates." className="mt-2 mb-3"/>

                {/* Apply Button  */}
                <div className="flex justify-end gap-3">
                    <Button onClick={onCancel} variant="secondary">Cancel</Button>
                    <Button onClick={onApply}>Apply</Button>
                </div>
            </CardContent>
        </Card>
    );
}