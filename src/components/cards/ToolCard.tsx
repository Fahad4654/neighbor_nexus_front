import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tool } from '@/lib/data';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { cn } from '@/lib/utils';
import { StarRating } from '../StarRating';

export function ToolCard({ tool }: { tool: Tool }) {
    const image = placeholderImages.find(img => img.id === tool.imageId);
    const avatar = placeholderImages.find(img => img.id === tool.user.avatarId);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
            {image && (
                <Image
                    src={image.imageUrl}
                    alt={image.description}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                />
            )}
            <Badge className={cn("absolute top-2 right-2", tool.available ? 'bg-green-500' : 'bg-red-500')}>
                {tool.available ? 'Available' : 'Rented'}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <Badge variant="outline" className="mb-2 capitalize">{tool.category}</Badge>
        <CardTitle className="text-lg mb-1">{tool.name}</CardTitle>
        <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
        
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-start gap-4">
        <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {avatar && <AvatarImage src={avatar.imageUrl} alt={avatar.description} data-ai-hint={avatar.imageHint} />}
              <AvatarFallback>{tool.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{tool.user.name}</p>
              <div className="flex items-center">
                 <StarRating rating={tool.user.rating} readOnly starSize={16}/>
                 <span className="text-xs text-muted-foreground ml-1">({tool.user.reviews} reviews)</span>
              </div>
            </div>
        </div>
        <div className="w-full flex items-center justify-between">
            <p className="text-lg font-semibold">
                ${tool.rate}
                <span className="text-sm font-normal text-muted-foreground">/day</span>
            </p>
            <Button disabled={!tool.available} className="bg-accent text-accent-foreground hover:bg-accent/90">Request</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
