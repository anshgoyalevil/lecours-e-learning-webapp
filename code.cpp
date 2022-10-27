#include<bits/stdc++.h>
using namespace std;
bool compare(pair<int,int>p1,pair<int,int>p2)
{
	if(p1.second==p2.second)
	{
		return p1.first<p2.first;
	}
	return p1.second>p2.second;
}
int main()
{
    int n;
    cin>>n;
    vector<int>arr(n);
    for (int i = 0; i < n; i++)
    {
        cin>>arr[i];
    }
	map<int,int>m;
	for(int i=0;i<n;i++)
	{
		m[arr[i]]+=1;
	}
	vector<pair<int,int>>a;
	for(auto it=m.begin();it!=m.end();it++)
	{
		a.push_back(make_pair(it->first,it->second));
	}
	sort(a.begin(),a.end(),compare);
	vector<int>ans;
	for(auto x:a)
	{
		while(x.second--)
		{
		ans.push_back(x.first);
		}
	}
	for(auto x:ans)
	{
		cout<<x<<" ";
	}
	return 0;
}
