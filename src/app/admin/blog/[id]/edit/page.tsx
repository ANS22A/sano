import { getAdminBlogPostById } from '@/app/actions/adminBlog.actions'
import { BlogForm } from '../../BlogForm'
import { notFound } from 'next/navigation'

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getAdminBlogPostById(id)
  
  if (!post) {
    notFound()
  }

  return <BlogForm post={post} isEdit />
}
