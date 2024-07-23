import { Title } from "@/components/brand-title";
import PostList from "@/components/post-list";
import SectionWrapper from "@/components/section-wrapper";
import { PAGES_META } from "@/constants/website";

export async function generateMetadata() {
  return PAGES_META.get("posts");
}

function Posts() {
  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      <Title className="mb-12">Posts</Title>
      <SectionWrapper className="h-fit">
        <PostList />
      </SectionWrapper>
    </div>
  );
}

export default Posts;
