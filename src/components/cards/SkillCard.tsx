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
import { Skill } from '@/lib/data';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { cn } from '@/lib/utils';
import { StarRating } from '../StarRating';

export function SkillCard({ skill }: { skill: Skill }) {
    const image = placeholderImages.find(img => img.id === skill.imageId);
    const avatar = placeholderImages.find(img => img.id === skill.user.avatarId);

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
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <Badge variant="outline" className="mb-2 capitalize">{skill.category}</Badge>
        <CardTitle className="text-lg mb-1">{skill.name}</CardTitle>
        <CardDescription className="line-clamp-2">{skill.description}</CardDescription>
        
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-start gap-4">
        <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {avatar && <AvatarImage src={avatar.imageUrl} alt={avatar.description} data-ai-hint={avatar.imageHint} />}
              <AvatarFallback>{skill.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{skill.user.name}</p>
              <div className="flex items-center">
                 <StarRating rating={skill.user.rating} readOnly starSize={16}/>
                 <span className="text-xs text-muted-foreground ml-1">({skill.user.reviews} reviews)</span>
              </div>
            </div>
        </div>
        <div className="w-full flex items-center justify-between">
            <p className="text-lg font-semibold">
                {skill.rate}
                <span className="text-sm font-normal text-muted-foreground">/hr</span>
            </p>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Request</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
