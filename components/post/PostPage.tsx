import PostCard from "./PostCard";
import { TbFileSad } from "react-icons/tb";
import PostPageHeader from "./PostPageHeader";

interface PostPageProps {
    postIds: string[]
}

export default function PostPage({
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
                {/* Fetch the name of logged in user */}
                <PostPageHeader name="Win"/>
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