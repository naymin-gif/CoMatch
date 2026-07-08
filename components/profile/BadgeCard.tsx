import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; 
import { Badge } from "@/components/ui/badge"; 

interface BadgeCardProps {
    title: string;
    items?: string[]; 
    className ?: string;
}

export default function BadgeCard({
    title, 
    items = [],
    className = ""
}: BadgeCardProps) {

    return (
        <Card className={`bg-comatch-background ${className}`.trim()} >
            <CardHeader className="border-b">
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            
            <CardContent className="flex flex-wrap gap-2">
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <Badge key={index} variant="secondary">
                            {item}
                        </Badge>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No items available.</p>
                )}
            </CardContent>
        </Card>
    );
}