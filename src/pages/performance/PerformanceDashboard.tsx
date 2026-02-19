import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, TrendingUp, CheckCircle, Clock, AlertCircle, Search, Filter } from "lucide-react";
import { toast } from "sonner";

// Components
const RatingBadge = ({ rating }: { rating: number }) => {
    let color = "bg-red-500/10 text-red-500 hover:bg-red-500/20";
    if (rating >= 8) color = "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    else if (rating >= 5) color = "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";

    return (
        <Badge className={`${color} border-none`}>
            {rating.toFixed(1)}
        </Badge>
    );
};

const AvailabilityIndicator = ({ isAvailable }: { isAvailable: boolean }) => (
    <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-muted-foreground">{isAvailable ? 'Available' : 'Busy'}</span>
    </div>
);

const PerformanceDashboard = () => {
    const [filter, setFilter] = useState("all"); // all, available, high, low
    const [sort, setSort] = useState("rating"); // rating, workload

    const { data, isLoading } = useQuery({
        queryKey: ['performance-dashboard'],
        queryFn: async () => {
            const res = await api.get('/performance/dashboard');
            return res.data;
        }
    });

    const { data: recommendations, refetch: getRecommendations } = useQuery({
        queryKey: ['recommendations'],
        queryFn: async () => {
            const res = await api.get('/performance/recommendations');
            return res.data;
        },
        enabled: false
    });

    const handleRecommend = () => {
        getRecommendations();
        toast.info("Fetching smart recommendations...");
    };

    const handleInvite = (user: any) => {
        // Mock invite for now
        toast.success(`Invite sent to ${user.name}`);
    };

    const getFilteredUsers = () => {
        if (!data?.users) return [];
        let users = [...data.users];

        // Filter
        if (filter === 'available') users = users.filter((u: any) => u.isAvailable);
        if (filter === 'high') users = users.filter((u: any) => u.performance.rating >= 8);
        if (filter === 'low') users = users.filter((u: any) => u.performance.rating < 5);

        // Sort
        if (sort === 'rating') {
            users.sort((a: any, b: any) => b.performance.rating - a.performance.rating);
        } else if (sort === 'workload') {
            users.sort((a: any, b: any) => a.performance.activeProjects - b.performance.activeProjects);
        }

        return users;
    };

    if (isLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Performance Dashboard</h1>
                    <p className="text-muted-foreground">Monitor team productivity and resource availability.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRecommend}>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Smart Recommend
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Rating</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.teamStats?.avgRating}</div>
                        <p className="text-xs text-muted-foreground">Average performance score</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.teamStats?.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Total members monitored</p>
                    </CardContent>
                </Card>
                {/* Add more stats if needed */}
            </div>

            {/* Recommendations Section */}
            {recommendations && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Top Recommended Users
                        </CardTitle>
                        <CardDescription>Based on high rating and availability</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            {recommendations.map((user: any) => (
                                <div key={user._id} className="flex items-center justify-between p-4 bg-background rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <RatingBadge rating={user.performance.rating} />
                                            </div>
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => handleInvite(user)}>Invite</Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Table */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Team Performance</CardTitle>
                        <div className="flex gap-2">
                            <select
                                className="bg-transparent border rounded p-2 text-sm"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Users</option>
                                <option value="available">Available Now</option>
                                <option value="high">High Performers</option>
                                <option value="low">Needs Improvement</option>
                            </select>
                            <select
                                className="bg-transparent border rounded p-2 text-sm"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="rating">Sort by Rating</option>
                                <option value="workload">Sort by Workload</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Completed</TableHead>
                                <TableHead>Workload</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {getFilteredUsers().map((user: any) => (
                                <TableRow key={user._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">{user.role.replace('_', ' ')}</TableCell>
                                    <TableCell>
                                        <RatingBadge rating={user.performance?.rating || 5} />
                                    </TableCell>
                                    <TableCell>
                                        <AvailabilityIndicator isAvailable={user.isAvailable} />
                                    </TableCell>
                                    <TableCell>{user.performance?.completedTasks || 0}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <span className="font-medium">{user.performance?.activeProjects || 0}</span> projects
                                            <span className="text-muted-foreground mx-1">•</span>
                                            <span className="font-medium">{user.performance?.pendingTasks || 0}</span> tasks
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">View Details</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default PerformanceDashboard;
