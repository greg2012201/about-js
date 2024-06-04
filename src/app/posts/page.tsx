import { Title } from "@/components/brand-title";
import PostList from "@/components/post-list";
import SectionWrapper from "@/components/section-wrapper";

function Posts() {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Title className="mb-12 mt-8">📖 Posts 📖</Title>
      <SectionWrapper>
        <PostList />
      </SectionWrapper>
    </div>
  );
}

export default Posts;
