import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { api } from '../lib/api'
import { useApp } from '../contexts/AppContext'
import { Button } from '../components/ui/button'
import { FileCard } from '../components/FileCard'
import { TooltipProvider } from '../components/ui/tooltip'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface TagData {
  tag: string
  count: number
  percentage: number
  category?: string
  size?: number
}

interface TagRelation {
  source: string
  target: string
  value: number
}

interface FileData {
  path: string
  name: string
  size: number
  lastModified: string
  type: string
  tags: string[]
  preview?: string
}

export function Dashboard() {
  const networkRef = useRef<HTMLDivElement>(null)
  const [tagData, setTagData] = useState<TagData[]>([])
  const [tagRelations, setTagRelations] = useState<TagRelation[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [relatedFiles, setRelatedFiles] = useState<FileData[]>([])
  const [showFileList, setShowFileList] = useState(false)
  const [allFiles, setAllFiles] = useState<FileData[]>([])
  const { state } = useApp()
  const navigate = useNavigate()

  const categorizeTag = (tag: string): string => {
    const techTags = ['react', 'typescript', 'javascript', 'python', 'node', 'api', 'database', 'sql']
    const designTags = ['ui', 'ux', 'design', 'layout', 'style', 'css', 'theme']
    const projectTags = ['feature', 'bug', 'fix', 'enhancement', 'refactor', 'test']
    const domainTags = ['auth', 'user', 'admin', 'data', 'analytics', 'security']
    
    const lowerTag = tag.toLowerCase()
    if (techTags.some(t => lowerTag.includes(t))) return 'tech'
    if (designTags.some(t => lowerTag.includes(t))) return 'design'
    if (projectTags.some(t => lowerTag.includes(t))) return 'project'
    if (domainTags.some(t => lowerTag.includes(t))) return 'domain'
    return 'other'
  }

  const generateTestTags = (): TagData[] => {
    const techTags = [
      'react', 'typescript', 'javascript', 'python', 'nodejs', 'express', 'mongodb', 'postgresql',
      'mysql', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'firebase', 'graphql',
      'rest-api', 'microservices', 'serverless', 'lambda', 'api-gateway', 'nginx', 'apache',
      'linux', 'ubuntu', 'centos', 'git', 'github', 'gitlab', 'bitbucket', 'jenkins', 'circleci',
      'travis-ci', 'github-actions', 'terraform', 'ansible', 'chef', 'puppet', 'vagrant',
      'webpack', 'vite', 'rollup', 'babel', 'eslint', 'prettier', 'jest', 'cypress', 'playwright',
      'react-testing-library', 'vitest', 'storybook', 'chromatic', 'vercel', 'netlify', 'heroku'
    ]
    
    const designTags = [
      'ui', 'ux', 'design', 'figma', 'sketch', 'adobe-xd', 'photoshop', 'illustrator',
      'prototyping', 'wireframe', 'mockup', 'usability', 'accessibility', 'responsive',
      'mobile-first', 'typography', 'color-theory', 'material-design', 'ant-design',
      'chakra-ui', 'tailwind', 'bootstrap', 'styled-components', 'emotion', 'css-in-js',
      'sass', 'less', 'postcss', 'grid', 'flexbox', 'animation', 'transitions', 'dark-mode'
    ]
    
    const projectTags = [
      'feature', 'bug', 'fix', 'enhancement', 'refactor', 'performance', 'optimization',
      'security', 'testing', 'documentation', 'migration', 'upgrade', 'deployment',
      'release', 'hotfix', 'patch', 'major', 'minor', 'breaking-change', 'deprecated',
      'experimental', 'beta', 'alpha', 'stable', 'maintenance', 'cleanup', 'technical-debt'
    ]
    
    const domainTags = [
      'auth', 'authentication', 'authorization', 'jwt', 'oauth', 'user-management',
      'admin', 'dashboard', 'analytics', 'reporting', 'data-visualization', 'charts',
      'e-commerce', 'payment', 'stripe', 'paypal', 'billing', 'subscription', 'saas',
      'crm', 'cms', 'blog', 'forum', 'chat', 'messaging', 'notification', 'email',
      'sms', 'push-notification', 'search', 'elasticsearch', 'solr', 'indexing',
      'caching', 'session', 'cookies', 'localization', 'i18n', 'l10n', 'timezone'
    ]
    
    const frameworkTags = [
      'nextjs', 'nuxtjs', 'gatsby', 'vue', 'angular', 'svelte', 'solid', 'preact',
      'ember', 'backbone', 'jquery', 'lodash', 'underscore', 'rxjs', 'mobx', 'redux',
      'zustand', 'context-api', 'swr', 'react-query', 'apollo', 'relay', 'prisma',
      'typeorm', 'sequelize', 'mongoose', 'knex', 'drizzle', 'tRPC', 'fastify',
      'koa', 'hapi', 'nestjs', 'strapi', 'sanity', 'contentful', 'headless-cms'
    ]
    
    const toolsTags = [
      'vscode', 'webstorm', 'sublime', 'atom', 'vim', 'emacs', 'postman', 'insomnia',
      'chrome-devtools', 'firefox-devtools', 'lighthouse', 'pagespeed', 'gtmetrix',
      'sentry', 'bugsnag', 'rollbar', 'datadog', 'newrelic', 'grafana', 'prometheus',
      'elk-stack', 'splunk', 'tableau', 'powerbi', 'metabase', 'superset', 'looker'
    ]
    
    const allBaseTags = [...techTags, ...designTags, ...projectTags, ...domainTags, ...frameworkTags, ...toolsTags]
    
    // Generate variations and combinations
    const generatedTags: string[] = []
    
    // Add base tags
    generatedTags.push(...allBaseTags)
    
    // Generate compound tags
    for (let i = 0; i < 200; i++) {
      const tag1 = allBaseTags[Math.floor(Math.random() * allBaseTags.length)]
      const tag2 = allBaseTags[Math.floor(Math.random() * allBaseTags.length)]
      if (tag1 !== tag2) {
        generatedTags.push(`${tag1}-${tag2}`)
      }
    }
    
    // Generate versioned tags
    const versions = ['v1', 'v2', 'v3', 'v4', 'v5', '2023', '2024', '2025']
    for (let i = 0; i < 100; i++) {
      const tag = allBaseTags[Math.floor(Math.random() * allBaseTags.length)]
      const version = versions[Math.floor(Math.random() * versions.length)]
      generatedTags.push(`${tag}-${version}`)
    }
    
    // Generate status tags
    const statuses = ['wip', 'done', 'todo', 'review', 'draft', 'final', 'approved', 'rejected']
    for (let i = 0; i < 50; i++) {
      const tag = allBaseTags[Math.floor(Math.random() * allBaseTags.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      generatedTags.push(`${tag}-${status}`)
    }
    
    // Generate platform-specific tags
    const platforms = ['web', 'mobile', 'ios', 'android', 'desktop', 'server', 'client']
    for (let i = 0; i < 70; i++) {
      const tag = allBaseTags[Math.floor(Math.random() * allBaseTags.length)]
      const platform = platforms[Math.floor(Math.random() * platforms.length)]
      generatedTags.push(`${platform}-${tag}`)
    }
    
    // Generate environment tags
    const environments = ['dev', 'staging', 'prod', 'test', 'local', 'demo']
    for (let i = 0; i < 50; i++) {
      const tag = allBaseTags[Math.floor(Math.random() * allBaseTags.length)]
      const env = environments[Math.floor(Math.random() * environments.length)]
      generatedTags.push(`${env}-${tag}`)
    }
    
    // Generate random suffixes
    const suffixes = ['pro', 'plus', 'premium', 'basic', 'advanced', 'lite', 'full', 'mini']
    for (let i = 0; i < 80; i++) {
      const tag = allBaseTags[Math.floor(Math.random() * allBaseTags.length)]
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
      generatedTags.push(`${tag}-${suffix}`)
    }
    
    // Generate random combinations with numbers
    for (let i = 0; i < 150; i++) {
      const tag = allBaseTags[Math.floor(Math.random() * allBaseTags.length)]
      const number = Math.floor(Math.random() * 100) + 1
      generatedTags.push(`${tag}-${number}`)
    }
    
    // Ensure we have exactly 1000 unique tags
    const uniqueTags = Array.from(new Set(generatedTags)).slice(0, 1000)
    while (uniqueTags.length < 1000) {
      const randomTag = `tag-${uniqueTags.length + 1}-${Math.random().toString(36).substr(2, 8)}`
      uniqueTags.push(randomTag)
    }
    
    // Create TagData with realistic distributions
    return uniqueTags.map((tag, index) => {
      // Use Zipf distribution for realistic tag frequency
      const rank = index + 1
      const count = Math.floor(Math.max(1, 500 / Math.pow(rank, 0.8)) + Math.random() * 10)
      
      return {
        tag,
        count,
        percentage: (count / 10000) * 100, // Assuming 10000 total files
        category: categorizeTag(tag),
        size: Math.sqrt(count) * 5
      }
    }).sort((a, b) => b.count - a.count)
  }

  const generateTestRelations = (tags: TagData[]): TagRelation[] => {
    const relations: TagRelation[] = []
    const topTags = tags.slice(0, 100) // Use top 100 tags for relations
    
    for (let i = 0; i < 200; i++) {
      const source = topTags[Math.floor(Math.random() * topTags.length)]
      const target = topTags[Math.floor(Math.random() * topTags.length)]
      
      if (source.tag !== target.tag) {
        const value = Math.floor(Math.random() * Math.min(source.count, target.count) / 2) + 1
        relations.push({
          source: source.tag,
          target: target.tag,
          value
        })
      }
    }
    
    return relations.sort((a, b) => b.value - a.value)
  }

  const handleNodeClick = (tagName: string) => {
    setSelectedTag(tagName)
    const filesWithTag = allFiles.filter(file => file.tags.includes(tagName))
    setRelatedFiles(filesWithTag)
    setShowFileList(true)
  }

  const filteredTagData = selectedCategory === 'all' 
    ? tagData 
    : tagData.filter(tag => tag.category === selectedCategory)

  const filteredRelations = tagRelations.filter(relation => {
    if (selectedCategory === 'all') return true
    const sourceTag = tagData.find(t => t.tag === relation.source)
    const targetTag = tagData.find(t => t.tag === relation.target)
    return sourceTag?.category === selectedCategory || targetTag?.category === selectedCategory
  })

  const loadTestData = () => {
    console.log('Loading test data...')
    setLoading(true)
    
    // Simulate API delay
    setTimeout(() => {
      const testTags = generateTestTags()
      const testRelations = generateTestRelations(testTags)
      
      console.log('Generated test data:', { tags: testTags.length, relations: testRelations.length })
      
      setAllTags(testTags.map(t => t.tag))
      setTagData(testTags)
      setTagRelations(testRelations.slice(0, 50))
      setLoading(false)
    }, 500)
  }

  const loadTagData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [tagsResponse, directoriesResponse] = await Promise.all([
        api.getAllTags(),
        api.getDirectories()
      ])
      
      setAllTags(tagsResponse.tags)
      
      const filePromises = directoriesResponse.directories.map(dir => 
        api.getFiles(dir.path)
      )
      
      const filesResponses = await Promise.all(filePromises)
      const filesData = filesResponses.flatMap(response => response.files)
      
      // Store all files data for later use
      const formattedFiles: FileData[] = filesData.map(file => ({
        path: file.path,
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        type: file.type,
        tags: file.tags,
        preview: file.preview
      }))
      setAllFiles(formattedFiles)
      
      const tagCounts = new Map<string, number>()
      const tagCooccurrence = new Map<string, Map<string, number>>()
      
      filesData.forEach(file => {
        file.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        })
        
        // Calculate tag co-occurrence for network visualization
        for (let i = 0; i < file.tags.length; i++) {
          for (let j = i + 1; j < file.tags.length; j++) {
            const tag1 = file.tags[i]
            const tag2 = file.tags[j]
            
            if (!tagCooccurrence.has(tag1)) {
              tagCooccurrence.set(tag1, new Map())
            }
            if (!tagCooccurrence.has(tag2)) {
              tagCooccurrence.set(tag2, new Map())
            }
            
            const map1 = tagCooccurrence.get(tag1)!
            const map2 = tagCooccurrence.get(tag2)!
            
            map1.set(tag2, (map1.get(tag2) || 0) + 1)
            map2.set(tag1, (map2.get(tag1) || 0) + 1)
          }
        }
      })
      
      const totalFiles = filesData.length
      const tagDataArray: TagData[] = Array.from(tagCounts.entries())
        .map(([tag, count]) => ({
          tag,
          count,
          percentage: totalFiles > 0 ? (count / totalFiles) * 100 : 0,
          category: categorizeTag(tag),
          size: Math.sqrt(count) * 5
        }))
        .sort((a, b) => b.count - a.count)
      
      const relations: TagRelation[] = []
      tagCooccurrence.forEach((targets, source) => {
        targets.forEach((value, target) => {
          if (value > 1 && source < target) { // Avoid duplicates and self-references
            relations.push({ source, target, value })
          }
        })
      })
      
      setTagData(tagDataArray)
      setTagRelations(relations.sort((a, b) => b.value - a.value).slice(0, 50))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タグデータの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('Dashboard mounted, loading real tag data...')
    loadTagData() // Load real data instead of test data
  }, [])

  // Advanced Network visualization with force simulation - NEVER OVERFLOW
  useEffect(() => {
    if (!networkRef.current || filteredRelations.length === 0) return

    // Clear previous content
    networkRef.current.innerHTML = ''

    // Get container dimensions with fallback
    const containerWidth = networkRef.current.clientWidth || window.innerWidth
    const containerHeight = networkRef.current.clientHeight || window.innerHeight
    
    console.log('Container dimensions:', { containerWidth, containerHeight })
    
    // Safety margins to ensure no cutoff
    const margin = 50
    const safeWidth = containerWidth - (margin * 2)
    const safeHeight = containerHeight - (margin * 2)
    
    // Create SVG with responsive dimensions and luxury dark background
    const svg = d3.create("svg")
      .attr("width", "100%")
      .attr("height", containerHeight)
      .attr("viewBox", [0, 0, containerWidth, containerHeight])
      .style("background", "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)")

    // Create nodes from filtered tag relations
    const nodeSet = new Set([
      ...filteredRelations.map(d => d.source),
      ...filteredRelations.map(d => d.target)
    ])

    const nodes = Array.from(nodeSet).map(tag => {
      const tagInfo = filteredTagData.find(t => t.tag === tag)
      return {
        id: tag,
        count: tagInfo?.count || 0,
        category: tagInfo?.category || 'other',
        group: Math.floor(Math.random() * 8) // Random cluster for demo
      }
    }).slice(0, 60) // Increased for better visualization

    // Filter relations to only include nodes we're showing
    const nodeIds = new Set(nodes.map(n => n.id))
    const links = filteredRelations
      .filter(d => nodeIds.has(d.source) && nodeIds.has(d.target))
      .slice(0, 100)
      .map(d => ({
        source: d.source,
        target: d.target,
        value: d.value
      }))
    
    console.log('Network visualization data:', { 
      nodes: nodes.length, 
      links: links.length,
      containerDimensions: { containerWidth, containerHeight },
      safeArea: { safeWidth, safeHeight }
    })

    // Luxury dark mode color palette
    const groupColorScale = d3.scaleOrdinal()
      .range([
        '#D4AF37',     // Gold
        '#C0C0C0',     // Silver
        '#CD7F32',     // Bronze
        '#E6E6FA',     // Lavender
        '#F0E68C',     // Khaki
        '#DDA0DD',     // Plum
        '#98FB98',     // Pale green
        '#F5DEB3',     // Wheat
        '#FFB6C1',     // Light pink
        '#87CEEB',     // Sky blue
        '#FFA07A',     // Light salmon
        '#20B2AA'      // Light sea green
      ])

    // Create gradient definitions
    const defs = svg.append("defs")

    // Add luxury drop shadow filter
    const shadowFilter = defs.append("filter")
      .attr("id", "luxury-shadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%")

    shadowFilter.append("feDropShadow")
      .attr("dx", "2")
      .attr("dy", "4")
      .attr("stdDeviation", "3")
      .attr("flood-color", "#000000")
      .attr("flood-opacity", "0.15")

    // Add subtle glow for elegance
    const glowFilter = defs.append("filter")
      .attr("id", "subtle-glow")

    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "2")
      .attr("result", "coloredBlur")

    const feMerge = glowFilter.append("feMerge")
    feMerge.append("feMergeNode").attr("in", "coloredBlur")
    feMerge.append("feMergeNode").attr("in", "SourceGraphic")

    // Calculate safe bounds for nodes with fallback values
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2
    
    // Safe calculation with fallback
    const maxNodeRadius = nodes.length > 0 ? 
      Math.max(...nodes.map(d => Math.sqrt(d.count || 1) * 1.5 + 8)) : 20
    
    // Define boundaries with validation
    const minX = Math.max(margin + maxNodeRadius, 20)
    const maxX = Math.max(containerWidth - margin - maxNodeRadius, minX + 100)
    const minY = Math.max(margin + maxNodeRadius, 20) 
    const maxY = Math.max(containerHeight - margin - maxNodeRadius, minY + 100)
    
    const forceStrength = Math.min(safeWidth, safeHeight) * -0.1

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).strength(0.15))
      .force("charge", d3.forceManyBody().strength(forceStrength))
      .force("center", d3.forceCenter(centerX, centerY))
      .force("collision", d3.forceCollide().radius(d => Math.sqrt(d.count || 1) * 1.5 + 12))

    // Add elegant dark mode links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#404040")
      .attr("stroke-opacity", 0.3)
      .attr("stroke-width", d => Math.sqrt(d.value) * 1.2)
      .style("stroke-linecap", "round")

    // Add nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))

    // Add luxury dark mode nodes with click functionality
    node.append("circle")
      .attr("r", d => Math.sqrt(d.count) * 1.5 + 8)
      .attr("fill", d => groupColorScale(d.group))
      .attr("stroke", d => selectedTag === d.id ? "#FFD700" : "#1a1a1a")
      .attr("stroke-width", d => selectedTag === d.id ? 4 : 2.5)
      .attr("filter", "url(#luxury-shadow)")
      .style("cursor", "pointer")
      .style("opacity", 0.95)
      .on("click", (event, d) => {
        event.stopPropagation()
        handleNodeClick(d.id)
      })

    // Note: Removed text labels for cleaner visualization

    // Add tooltips
    node.append("title")
      .text(d => `${d.id}\nCategory: ${d.category}\nCount: ${d.count}`)

    // Simulation tick function
    simulation.on("tick", () => {
      // Gentle boundary enforcement 
      nodes.forEach(node => {
        if (node.x < minX) node.x = minX
        if (node.x > maxX) node.x = maxX
        if (node.y < minY) node.y = minY
        if (node.y > maxY) node.y = maxY
      })

      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)

      node
        .attr("transform", d => `translate(${d.x},${d.y})`)
    })

    // Drag functions
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event) {
      // Constrain drag position to boundaries
      const constrainedX = Math.max(minX, Math.min(maxX, event.x))
      const constrainedY = Math.max(minY, Math.min(maxY, event.y))
      event.subject.fx = constrainedX
      event.subject.fy = constrainedY
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    // Create tooltip div
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.9)")
      .style("color", "#fff")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.3)")
      .style("border", "1px solid rgba(212, 175, 55, 0.3)")

    // Add sophisticated hover interactions
    node
      .on("mouseover", function(event, d) {
        d3.select(this).select("circle")
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr("r", d => Math.sqrt(d.count) * 1.5 + 12)
          .attr("stroke-width", 3.5)
          .style("opacity", 1)
          .attr("filter", "url(#subtle-glow)")

        // Show tooltip with tag name
        tooltip
          .style("visibility", "visible")
          .text(d.id)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")

        // Elegant dark mode link highlighting
        link
          .transition()
          .duration(300)
          .style("stroke-opacity", l => 
            (l.source === d || l.target === d) ? 0.8 : 0.1)
          .style("stroke-width", l => 
            (l.source === d || l.target === d) ? Math.sqrt(l.value) * 2 : Math.sqrt(l.value) * 1.2)
          .attr("stroke", l => 
            (l.source === d || l.target === d) ? "#D4AF37" : "#404040")
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
      })
      .on("mouseout", function(event, d) {
        d3.select(this).select("circle")
          .transition()
          .duration(400)
          .ease(d3.easeCubicOut)
          .attr("r", d => Math.sqrt(d.count) * 1.5 + 8)
          .attr("stroke-width", 2.5)
          .style("opacity", 0.95)
          .attr("filter", "url(#luxury-shadow)")

        // Hide tooltip
        tooltip.style("visibility", "hidden")

        // Reset dark mode links elegantly
        link
          .transition()
          .duration(400)
          .style("stroke-opacity", 0.3)
          .style("stroke-width", d => Math.sqrt(d.value) * 1.2)
          .attr("stroke", "#404040")
      })

    const svgElement = svg.node()
    if (svgElement) {
      networkRef.current.appendChild(svgElement)
      console.log('SVG appended successfully')
    } else {
      console.error('Failed to create SVG')
    }

    return () => {
      simulation.stop()
      if (networkRef.current) {
        networkRef.current.innerHTML = ''
      }
      // Clean up tooltip
      d3.select("body").selectAll(".tooltip").remove()
    }
  }, [filteredTagData, filteredRelations, selectedTag])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Simple debounced resize handler
      setTimeout(() => {
        if (filteredRelations.length > 0) {
          // Trigger re-render by updating state
          setTagData(prev => [...prev])
        }
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [filteredRelations])

  // Generate legend data
  const legendData = [
    { color: '#D4AF37', category: 'Tech', description: '技術関連タグ' },
    { color: '#C0C0C0', category: 'Design', description: 'デザイン関連タグ' },
    { color: '#CD7F32', category: 'Project', description: 'プロジェクト関連タグ' },
    { color: '#E6E6FA', category: 'Domain', description: 'ドメイン固有タグ' },
    { color: '#F0E68C', category: 'Framework', description: 'フレームワーク関連タグ' },
    { color: '#DDA0DD', category: 'Tools', description: 'ツール関連タグ' },
    { color: '#98FB98', category: 'Other', description: 'その他のタグ' }
  ]

  return (
    <div className="w-full h-screen overflow-hidden relative flex flex-col">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-4">
        {/* Category Filter */}
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-black bg-opacity-80 text-white border border-gray-600 rounded px-3 py-1 text-sm"
        >
          <option value="all">全カテゴリ</option>
          <option value="tech">技術</option>
          <option value="design">デザイン</option>
          <option value="project">プロジェクト</option>
          <option value="domain">ドメイン</option>
          <option value="other">その他</option>
        </select>
        
        {/* Debug info */}
        <div className="text-white text-sm bg-black bg-opacity-50 p-2 rounded">
          Tags: {filteredTagData.length} | Relations: {filteredRelations.length} | Loading: {loading.toString()}
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-xl">Loading network...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-400 text-xl">{error}</div>
        </div>
      ) : filteredRelations.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-xl">No data available</div>
        </div>
      ) : (
        <>
          <div ref={networkRef} className="flex-1 w-full bg-gradient-to-br from-gray-900 to-black" />
          
          {/* Statistics Panel */}
          <div className="bg-black bg-opacity-90 backdrop-blur-sm border-t border-gray-700 p-4">
            <div className="grid grid-cols-4 gap-6 mb-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{filteredTagData.length}</div>
                <div className="text-gray-400 text-sm">総タグ数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{filteredRelations.length}</div>
                <div className="text-gray-400 text-sm">関連性</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{Math.round(filteredTagData.reduce((sum, tag) => sum + tag.count, 0) / filteredTagData.length) || 0}</div>
                <div className="text-gray-400 text-sm">平均使用回数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{Math.max(...filteredTagData.map(t => t.count), 0)}</div>
                <div className="text-gray-400 text-sm">最大使用回数</div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
              {legendData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-600" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-white text-sm font-medium">{item.category}</span>
                  <span className="text-gray-400 text-xs">{item.description}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-3 text-gray-500 text-xs">
              ネットワーク図: タグ間の関連性を可視化 • ノードサイズ = 使用頻度 • 線の太さ = 共起頻度 • クリックでファイル一覧表示
            </div>
          </div>
        </>
      )}
      
      {/* File List Modal */}
      {showFileList && selectedTag && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg border border-border shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 pb-4 border-b">
              <div>
                <h3 className="text-xl font-bold">タグ "{selectedTag}" を含むファイル</h3>
                <p className="text-sm text-muted-foreground mt-1">{relatedFiles.length} 件のファイル</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFileList(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <TooltipProvider>
                <div className="grid gap-4">
                  {relatedFiles.map((file) => (
                    <FileCard
                      key={file.path}
                      file={file}
                      onClick={() => {
                        setShowFileList(false)
                        navigate(`/file/${encodeURIComponent(file.path)}`)
                      }}
                      onToggleFavorite={(e) => {
                        e.stopPropagation()
                        // Handle favorite toggle
                      }}
                      onCopyPath={() => {
                        navigator.clipboard.writeText(file.path)
                      }}
                      onCopyContent={async () => {
                        // Handle copy content
                      }}
                      onDelete={() => {
                        // Handle delete
                      }}
                      isFavorite={false}
                      viewMode="list"
                    />
                  ))}
                </div>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}