import PostCard from "./PostCard";
import { TbFileSad } from "react-icons/tb";
import PostPageHeader from "./PostPageHeader";
import { supabase } from "@/utils/supabse";

interface PostPageProps {
    currentUserName: string;
    postIds: string[]
}

interface Post {
    id: string;
    owner_id: string;
    title: string;
    description: string;
    commitment_level: string;
    image_url: string;
    created_at: string;
}

interface Comment {
    id: string;
    post_id: string;
    profile_id: string;
    content: string;
    created_at: string;
}

export default function PostPage({
    currentUserName,
    postIds
} : PostPageProps) {
    if (postIds.length == 0) {
        return (
            <div className="flex flex-row gap-3 items-center mt-3">
                <TbFileSad /> 
                <span> Posts will appear here when members post teammate calls. </span>
            </div>
        );
    } else {
        return (
            <div className="flex flex-col gap-4">
                <PostPageHeader name={currentUserName}/>
                <div className="flex flex-col gap-4">
                    {postIds.map((post) => 
                        <PostCard 
                            key={post}
                            postid={post}
                        />
                    )}
                </div>
            </div>
        )
    }
}